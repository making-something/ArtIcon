import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { TaskInsert } from '../src/types/database';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample tasks for each category
const sampleTasks: TaskInsert[] = [
  // Video Category Tasks
  {
    category: 'video',
    title: 'Create a 30-Second Brand Teaser',
    description: 'Design and produce a compelling 30-second video teaser for a fictional tech startup. The video should showcase the company\'s mission, product, and vision. Focus on storytelling, visual appeal, and professional editing. Include motion graphics, background music, and a clear call-to-action.'
  },
  {
    category: 'video',
    title: 'Product Demonstration Video',
    description: 'Create a 2-minute product demonstration video for a mobile app. Show key features, user interface, and benefits. The video should include screen recordings, voice-over narration, and smooth transitions. Demonstrate real-world usage scenarios and highlight unique selling points.'
  },
  {
    category: 'video',
    title: 'Event Highlights Montage',
    description: 'Produce a dynamic 3-minute highlights video for a fictional tech conference. Create engaging transitions, add animated text overlays, incorporate background music, and maintain high energy throughout. Should feel professional and exciting.'
  },

  // UI/UX Category Tasks
  {
    category: 'ui_ux',
    title: 'Mobile Banking App Redesign',
    description: 'Design a complete mobile banking application with modern UI/UX principles. Create wireframes, user flow diagrams, and high-fidelity mockups for key screens including login, dashboard, transfers, and settings. Focus on accessibility, security, and user-friendly navigation.'
  },
  {
    category: 'ui_ux',
    title: 'E-commerce Checkout Flow',
    description: 'Design an optimized checkout flow for an e-commerce platform. Create user personas, journey maps, and interactive prototypes. Address pain points in current checkout processes, implement progressive disclosure, and ensure mobile responsiveness. Include payment integration screens.'
  },
  {
    category: 'ui_ux',
    title: 'Healthcare Patient Portal',
    description: 'Design a comprehensive patient portal for a healthcare system. Include appointment scheduling, medical records access, prescription management, and doctor-patient messaging. Prioritize privacy, clarity, and ease of use for elderly users. Create a design system with consistent components.'
  },

  // Graphics Category Tasks
  {
    category: 'graphics',
    title: 'Tech Conference Brand Identity',
    description: 'Create a complete brand identity package for a tech conference including logo design, color palette, typography guidelines, and marketing materials. Design conference badges, banners, social media templates, and presentation slides. Ensure the brand appeals to tech professionals and sponsors.'
  },
  {
    category: 'graphics',
    title: 'Mobile App Icon Set',
    description: 'Design a comprehensive icon set for a productivity mobile app. Create app icons in multiple sizes, notification icons, tab bar icons, and custom illustrations for onboarding screens. Follow platform guidelines (iOS/Android) and maintain visual consistency across all assets.'
  },
  {
    category: 'graphics',
    title: 'Infographic Data Visualization',
    description: 'Create a detailed infographic about sustainable technology trends. Design custom charts, icons, and illustrations to present complex data in an engaging way. The infographic should be suitable for both print and digital formats, with a modern, clean aesthetic.'
  }
];

async function setupTasks() {
  try {
    console.log('🗑️  Clearing existing tasks...');

    // Delete all existing tasks
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (deleteError) {
      throw deleteError;
    }

    console.log('✅ Existing tasks cleared successfully');

    console.log('📝 Adding sample tasks...');

    // Insert new tasks
    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(sampleTasks)
      .select();

    if (insertError) {
      throw insertError;
    }

    console.log(`✅ Successfully created ${insertedTasks?.length || 0} tasks:`);

    // Group tasks by category for display
    const tasksByCategory = insertedTasks?.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
      return acc;
    }, {} as Record<string, typeof insertedTasks>) || {};

    Object.entries(tasksByCategory).forEach(([category, tasks]) => {
      console.log(`\n📂 ${category.toUpperCase()} Category:`);
      tasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.title}`);
      });
    });

    console.log('\n🎉 Task setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up tasks:', error);
    process.exit(1);
  }
}

// Run the setup
setupTasks();