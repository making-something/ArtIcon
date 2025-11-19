#!/usr/bin/env python3
"""Image optimizer with AVIF/WebP output and smart savings guards."""

import argparse
import os
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Tuple

from PIL import Image


def clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def parse_format_string(raw: Optional[str]) -> List[str]:
    if not raw:
        return []
    parts = [part.strip() for part in raw.split(',') if part.strip()]
    return parts or []


class ImageOptimizer:
    def __init__(
        self,
        quality: int = 90,
        max_width: int = 2048,
        preferred_format: str = "avif",
        fallback_formats: Optional[Sequence[str]] = None,
        min_savings_percent: float = 0.5,
        force_conversion: bool = False,
        lossless: bool = False,
        webp_method: int = 6,
    ) -> None:
        self.quality = clamp(int(quality), 1, 100)
        self.max_width = max(100, int(max_width))
        self.preferred_format = self.normalize_format(preferred_format)
        self.fallback_formats = self._normalize_format_list(
            fallback_formats or ["webp", "jpeg"]
        )
        self.min_savings_percent = max(0.0, min(100.0, float(min_savings_percent)))
        self.force_conversion = force_conversion
        self.lossless = lossless
        self.webp_method = clamp(int(webp_method), 0, 6)
        self.supported_formats = {
            ".avif",
            ".heic",
            ".heif",
            ".jpg",
            ".jpeg",
            ".png",
            ".tif",
            ".tiff",
            ".webp",
        }
        self.heif_formats = {".heic", ".heif", ".avif"}

    @staticmethod
    def normalize_format(value: Optional[str]) -> str:
        if not value:
            return "AUTO"
        cleaned = value.strip().lower()
        alias_map = {
            "jpg": "jpeg",
            "tif": "tiff",
            "av1": "avif",
            "heic": "heif",
            "heif": "heif",
        }
        normalized = alias_map.get(cleaned, cleaned)
        return normalized.upper()

    def _normalize_format_list(self, values: Sequence[str]) -> List[str]:
        normalized: List[str] = []
        for value in values:
            fmt = self.normalize_format(value)
            if fmt in {"AUTO", "ORIGINAL"}:
                continue
            if fmt and fmt not in normalized:
                normalized.append(fmt)
        return normalized

    @staticmethod
    def has_alpha(image: Image.Image) -> bool:
        if image.mode in ("RGBA", "LA"):
            return True
        if image.mode == "P":
            return "transparency" in image.info
        return False

    @staticmethod
    def format_supports_alpha(target_format: str) -> bool:
        return target_format in {"PNG", "WEBP", "AVIF", "TIFF"}

    @staticmethod
    def format_suffix(target_format: str, original_suffix: str) -> str:
        suffix_map = {
            "JPEG": ".jpg",
            "PNG": ".png",
            "WEBP": ".webp",
            "AVIF": ".avif",
            "TIFF": ".tiff",
            "HEIF": ".heif",
        }
        return suffix_map.get(target_format, original_suffix or ".jpg")

    def resize_image(self, image: Image.Image, max_width: int) -> Image.Image:
        width, height = image.size
        if width > max_width:
            ratio = max_width / width
            new_height = int(height * ratio)
            return image.resize((max_width, new_height), Image.Resampling.LANCZOS)
        return image

    def determine_output_format(
        self, original_path: Path, original_format: Optional[str], has_alpha: bool
    ) -> Tuple[str, str]:
        suffix = original_path.suffix.lower()
        original_fmt = (original_format or "").upper()
        if not original_fmt and suffix:
            original_fmt = self.normalize_format(suffix.lstrip("."))
            if original_fmt in {"AUTO", "ORIGINAL"}:
                original_fmt = "JPEG"

        desired = self.preferred_format
        if desired == "ORIGINAL" and original_fmt:
            return original_fmt, original_path.suffix or self.format_suffix(original_fmt, suffix)

        candidates: List[str] = []

        def add_candidate(option: Optional[str]) -> None:
            if not option:
                return
            option = option.upper()
            if option not in candidates and option not in {"AUTO", "ORIGINAL"}:
                candidates.append(option)

        if desired == "AUTO":
            palette = ("AVIF", "WEBP", "PNG") if has_alpha else ("AVIF", "WEBP", "JPEG")
            for fmt in palette:
                add_candidate(fmt)
        else:
            add_candidate(desired)

        for fmt in self.fallback_formats:
            add_candidate(fmt)

        add_candidate(original_fmt)
        add_candidate("JPEG")

        for candidate in candidates:
            if has_alpha and not self.format_supports_alpha(candidate):
                continue
            return candidate, self.format_suffix(candidate, original_path.suffix)

        return "JPEG", self.format_suffix("JPEG", original_path.suffix)

    def build_save_kwargs(self, target_format: str, metadata: Optional[dict]) -> dict:
        kwargs = {"format": target_format}
        exif_bytes = metadata.get("exif") or metadata.get("Exif") if metadata else None

        if target_format == "JPEG":
            kwargs.update({"quality": self.quality, "optimize": True, "progressive": True})
            if exif_bytes:
                kwargs["exif"] = exif_bytes
        elif target_format == "PNG":
            kwargs["optimize"] = True
        elif target_format == "WEBP":
            kwargs.update({"quality": self.quality, "method": self.webp_method})
            if self.lossless:
                kwargs["lossless"] = True
        elif target_format == "AVIF":
            kwargs["quality"] = self.quality
            if self.lossless:
                kwargs["lossless"] = True
        elif target_format == "TIFF":
            kwargs["compression"] = "tiff_deflate"
        elif target_format == "HEIF":
            kwargs["quality"] = self.quality

        return kwargs

    def should_keep_conversion(
        self, original_size: int, new_size: int, compression_ratio: float
    ) -> Tuple[bool, Optional[str]]:
        if self.force_conversion or original_size == 0:
            return True, None
        if new_size >= original_size:
            return False, "new file is larger"
        if compression_ratio < self.min_savings_percent:
            return False, f"savings below {self.min_savings_percent:.2f}%"
        return True, None

    def optimize_image(self, image_path: str) -> Optional[dict]:
        original_path = Path(image_path)
        original_size = original_path.stat().st_size
        final_path = original_path

        try:
            with Image.open(original_path) as img:
                metadata = dict(img.info)
                has_alpha = self.has_alpha(img)
                target_format, output_suffix = self.determine_output_format(
                    original_path, img.format, has_alpha
                )

                if target_format == "JPEG" and img.mode not in ("RGB", "L"):
                    img = img.convert("RGB")
                elif has_alpha and img.mode not in ("RGBA", "LA"):
                    img = img.convert("RGBA")
                elif not has_alpha and img.mode not in ("RGB", "L"):
                    img = img.convert("RGB")

                img = self.resize_image(img, self.max_width)

                final_path = (
                    original_path
                    if output_suffix == original_path.suffix
                    else original_path.with_suffix(output_suffix)
                )

                temp_file = tempfile.NamedTemporaryFile(
                    delete=False, suffix=output_suffix or ".tmp", dir=final_path.parent
                )
                temp_path = Path(temp_file.name)
                temp_file.close()

                save_kwargs = self.build_save_kwargs(target_format, metadata)

                try:
                    img.save(temp_path, **save_kwargs)
                except Exception:
                    if temp_path.exists():
                        temp_path.unlink()
                    raise

                new_size = temp_path.stat().st_size
                compression_ratio = (
                    ((original_size - new_size) / original_size * 100) if original_size else 0.0
                )
                keep_conversion, skip_reason = self.should_keep_conversion(
                    original_size, new_size, compression_ratio
                )

                if keep_conversion:
                    os.replace(temp_path, final_path)
                    if final_path != original_path and original_path.exists():
                        original_path.unlink()
                    changed = True
                else:
                    temp_path.unlink()
                    final_path = original_path
                    new_size = original_size
                    compression_ratio = 0.0
                    changed = False

            self._print_result(
                original_path,
                final_path,
                original_size,
                new_size,
                compression_ratio,
                changed,
                skip_reason,
            )

            return {
                "original": str(original_path),
                "optimized": str(final_path),
                "original_size": original_size,
                "optimized_size": new_size,
                "compression_ratio": compression_ratio,
                "status": "optimized" if changed else "skipped",
            }

        except Exception as exc:
            print(f"✗ Error processing {original_path.name}: {exc}")
            return None

    @staticmethod
    def _print_result(
        original_path: Path,
        final_path: Path,
        original_size: int,
        new_size: int,
        compression_ratio: float,
        changed: bool,
        skip_reason: Optional[str],
    ) -> None:
        if changed:
            print(f"✓ {original_path}")
            print(f"  Original: {original_size:,} bytes")
            print(f"  Optimized: {new_size:,} bytes")
            print(f"  Reduced by: {compression_ratio:.2f}%")
            print(f"  Saved to: {final_path}")
        else:
            reason = skip_reason or "no meaningful savings"
            print(f"↷ {original_path} (skipped: {reason})")
        print()

    def optimize_folder(self, folder_path: str = ".") -> None:
        root_path = Path(folder_path).expanduser().resolve()
        if not root_path.exists():
            print(f"Folder not found: {root_path}")
            return

        image_files = [
            path
            for path in root_path.rglob("*")
            if path.is_file() and path.suffix.lower() in self.supported_formats
        ]

        if not image_files:
            print("No supported image files found!")
            return

        print(f"Found {len(image_files)} images to optimize...")
        print("=" * 50)

        stats: List[dict] = []
        total_original = 0
        total_optimized = 0
        optimized_count = 0
        skipped_count = 0

        for image_file in sorted(image_files):
            result = self.optimize_image(str(image_file))
            if not result:
                continue
            stats.append(result)
            total_original += result["original_size"]
            total_optimized += result["optimized_size"]
            if result["status"] == "optimized":
                optimized_count += 1
            else:
                skipped_count += 1

        if not stats:
            print("No files were processed.")
            return

        total_saved = total_original - total_optimized
        total_compression = (total_saved / total_original * 100) if total_original else 0

        print("=" * 50)
        print("OPTIMIZATION SUMMARY")
        print("=" * 50)
        print(f"Images processed: {len(stats)}")
        print(f"Converted: {optimized_count}")
        print(f"Skipped: {skipped_count}")
        print(
            f"Total original size: {total_original:,} bytes ({total_original / 1024 / 1024:.1f} MB)"
        )
        print(
            f"Total optimized size: {total_optimized:,} bytes ({total_optimized / 1024 / 1024:.1f} MB)"
        )
        print(
            f"Total space saved: {total_saved:,} bytes ({total_saved / 1024 / 1024:.1f} MB)"
        )
        print(f"Overall compression: {total_compression:.2f}%")

        log_file = root_path / "optimization_log.txt"
        with open(log_file, "w", encoding="utf-8") as handle:
            handle.write(
                f"Image Optimization Log - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            )
            handle.write("=" * 60 + "\n\n")

            for stat in stats:
                rel_original = os.path.relpath(stat["original"], root_path)
                rel_optimized = os.path.relpath(stat["optimized"], root_path)
                handle.write(f"File: {rel_original}\n")
                handle.write(f"  Optimized as: {rel_optimized}\n")
                handle.write(f"  Original size: {stat['original_size']:,} bytes\n")
                handle.write(f"  Result size: {stat['optimized_size']:,} bytes\n")
                handle.write(f"  Compression: {stat['compression_ratio']:.2f}%\n")
                handle.write(f"  Status: {stat['status']}\n\n")

            handle.write("=" * 60 + "\n")
            handle.write("SUMMARY:\n")
            handle.write(f"Images processed: {len(stats)}\n")
            handle.write(f"Converted: {optimized_count}\n")
            handle.write(f"Skipped: {skipped_count}\n")
            handle.write(f"Total original: {total_original:,} bytes\n")
            handle.write(f"Total optimized: {total_optimized:,} bytes\n")
            handle.write(
                f"Space saved: {total_saved:,} bytes ({total_compression:.2f}%)\n"
            )

        print(f"\nDetailed log saved to: {log_file}")


def prompt_with_default(prompt: str, default_value: str, caster):
    response = input(f"{prompt} [{default_value}]: ") or str(default_value)
    return caster(response)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Optimize images in-place using AVIF/WebP with sensible fallbacks"
    )
    parser.add_argument("target_folder", nargs="?", default=None, help="Folder to scan")
    parser.add_argument("--quality", type=int, default=90, help="Quality (1-100)")
    parser.add_argument("--max-width", type=int, default=2048, help="Max width before resizing")
    parser.add_argument(
        "--preferred-format",
        default="avif",
        help="Primary output format (auto, avif, webp, jpeg, original)",
    )
    parser.add_argument(
        "--fallback-formats",
        default="webp,jpeg",
        help="Comma list of fallback formats",
    )
    parser.add_argument(
        "--min-savings",
        type=float,
        default=0.5,
        help="Minimum percent savings required before keeping a conversion",
    )
    parser.add_argument("--force", action="store_true", help="Always keep conversions")
    parser.add_argument("--lossless", action="store_true", help="Attempt lossless AVIF/WebP")
    parser.add_argument(
        "--webp-method",
        type=int,
        default=6,
        help="WEBP encoder effort (0-6)",
    )
    parser.add_argument(
        "--interactive",
        action="store_true",
        help="Prompt for settings even if arguments are provided",
    )
    return parser.parse_args()


def resolve_config(args: argparse.Namespace) -> dict:
    interactive = args.interactive or (len(sys.argv) == 1)
    fallback_formats = parse_format_string(args.fallback_formats)
    config = {
        "target_folder": args.target_folder or ".",
        "quality": args.quality,
        "max_width": args.max_width,
        "preferred_format": args.preferred_format,
        "fallback_formats": fallback_formats or ["webp", "jpeg"],
        "min_savings": args.min_savings,
        "force": args.force,
        "lossless": args.lossless,
        "webp_method": args.webp_method,
    }

    if not interactive:
        return config

    try:
        config["quality"] = clamp(
            prompt_with_default("Quality (1-100)", config["quality"], int), 1, 100
        )
        config["max_width"] = max(
            100,
            prompt_with_default("Max width", config["max_width"], int),
        )
        preferred = prompt_with_default(
            "Preferred format (auto/avif/webp/jpeg/original)",
            config["preferred_format"],
            str,
        )
        config["preferred_format"] = preferred
        fallback_raw = prompt_with_default(
            "Fallback formats (comma list)",
            ",".join(config["fallback_formats"]),
            str,
        )
        config["fallback_formats"] = parse_format_string(fallback_raw) or ["webp", "jpeg"]
        config["min_savings"] = max(
            0.0,
            prompt_with_default("Minimum savings %", config["min_savings"], float),
        )
        config["target_folder"] = prompt_with_default(
            "Folder to scan", config["target_folder"], str
        )
    except (ValueError, EOFError):
        print("Invalid input detected. Reverting to defaults above.")

    return config


def install_dependencies() -> None:
    required_packages = {
        "pillow-heif": "pillow_heif",
        "pillow-avif-plugin": "pillow_avif",
    }

    for package, module_name in required_packages.items():
        try:
            __import__(module_name)
            print(f"✓ {package} already installed")
        except ImportError:
            print(f"Installing {package}...")
            os.system(f"{sys.executable} -m pip install {package}")
            print(f"✓ {package} installed successfully")


def register_codecs() -> None:
    try:
        import pillow_heif
    except ImportError:
        pillow_heif = None

    if pillow_heif:
        for func_name in (
            "register_heif_opener",
            "register_heif_saver",
            "register_avif_opener",
            "register_avif_saver",
        ):
            register = getattr(pillow_heif, func_name, None)
            if callable(register):
                register()

    try:
        import pillow_avif  # noqa: F401
    except ImportError:
        pass


def main() -> None:
    print("🖼️  Image Optimizer")
    print("=" * 30)

    args = parse_args()
    config = resolve_config(args)

    print("\nOptimizing with:")
    print(f"  Quality: {config['quality']}")
    print(f"  Max width: {config['max_width']}px")
    print(f"  Preferred format: {config['preferred_format']}")
    print(f"  Fallback formats: {', '.join(config['fallback_formats'])}")
    print(f"  Min savings: {config['min_savings']:.2f}%")
    print(f"  Lossless mode: {'on' if config['lossless'] else 'off'}")
    print(f"  Force conversion: {'on' if config['force'] else 'off'}")
    print(f"  Target folder: {config['target_folder']}")
    print()

    optimizer = ImageOptimizer(
        quality=config["quality"],
        max_width=config["max_width"],
        preferred_format=config["preferred_format"],
        fallback_formats=config["fallback_formats"],
        min_savings_percent=config["min_savings"],
        force_conversion=config["force"],
        lossless=config["lossless"],
        webp_method=config["webp_method"],
    )
    optimizer.optimize_folder(config["target_folder"])

    print("\n✅ Optimization complete!")


if __name__ == "__main__":
    install_dependencies()
    register_codecs()
    main()