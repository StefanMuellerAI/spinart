import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// Force dynamic rendering to read headers
export const dynamic = 'force-dynamic';

// Root route redirects to the appropriate locale
export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  
  // Determine locale from Accept-Language header
  let locale = 'de'; // default
  
  // Check language preferences in order
  const languages = acceptLanguage.toLowerCase();
  if (languages.startsWith('en') || languages.includes(',en')) {
    locale = 'en';
  } else if (languages.startsWith('ja') || languages.includes(',ja')) {
    locale = 'ja';
  }
  
  // Server-side redirect (no client rendering needed)
  redirect(`/${locale}`);
}
