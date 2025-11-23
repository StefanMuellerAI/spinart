import SpinArt from '@/components/SpinArt';
import LegalFooter from '@/components/LegalFooter';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-gray-800">
      <div className="flex-1 flex flex-col items-center justify-center">
        <SpinArt />
      </div>
      <LegalFooter />
    </main>
  );
}
