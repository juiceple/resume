import { headers } from 'next/headers';
import MobileIndex from '@/components/MobileIndex';
import DesktopIndex from '@/components/DesktopIndex';
import { isMobile } from '@/utils/deviceDetection';


export default function Home() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobileView = isMobile(userAgent);

  return isMobileView ? <MobileIndex /> : <DesktopIndex />;
}


