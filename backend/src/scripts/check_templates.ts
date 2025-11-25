
import { whatsappClient, businessAccountId } from '../services/whatsapp-transport';

async function checkTemplates() {
  console.log('🔍 Checking available WhatsApp templates...');
  console.log(`   Business Account ID: ${businessAccountId}`);

  try {
    let allTemplates: any[] = [];
    let nextUrl = `/${businessAccountId}/message_templates?limit=100`; // Request higher limit per page

    while (nextUrl) {
      // If nextUrl is a full URL (from paging.next), we need to extract the relative path or handle it carefully.
      // The axios client has a baseURL set. If paging.next is a full URL, using client.get(fullUrl) might double-prefix if not careful,
      // OR axios might handle absolute URLs correctly by ignoring baseURL.
      // Let's try to use the full URL if it looks like one, otherwise use relative.
      
      // However, whatsappClient is configured with baseURL 'https://graph.facebook.com/v21.0'
      // The paging.next usually returns the full URL like 'https://graph.facebook.com/v21.0/...'
      
      const response: any = await whatsappClient.get(nextUrl.replace('https://graph.facebook.com/v21.0', ''));
      
      if (response.data && response.data.data) {
        const templates = response.data.data;
        allTemplates = [...allTemplates, ...templates];
        console.log(`   Fetched ${templates.length} templates...`);
        
        if (response.data.paging && response.data.paging.next) {
            nextUrl = response.data.paging.next;
        } else {
            nextUrl = '';
        }
      } else {
        console.log('⚠️  No data found in response.');
        break;
      }
    }

    console.log(`\n✅ Found TOTAL ${allTemplates.length} templates:`);
    console.table(allTemplates.map((t: any) => ({
      name: t.name,
      status: t.status,
      language: t.language,
      category: t.category
    })));
    
    // Check specifically for the ones we want
    const requiredTemplates = ['application_received', 'icon_selected', 'icon_not_selected'];
    console.log('\n🔍 Verifying required templates:');
    requiredTemplates.forEach(reqName => {
        const found = allTemplates.find(t => t.name === reqName);
        if (found) {
            console.log(`   ✅ ${reqName}: FOUND (Status: ${found.status})`);
        } else {
            console.log(`   ❌ ${reqName}: NOT FOUND`);
        }
    });

  } catch (error: any) {
    console.error('❌ Error fetching templates:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

checkTemplates();
