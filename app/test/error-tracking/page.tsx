import { ErrorTrackingDemo } from '@/components/error-tracking-demo';

export const metadata = {
  title: 'エラートラッキング デモ | Tent Space',
  robots: {
    index: false, // テストページなのでインデックスしない
    follow: false,
  },
};

export default function ErrorTrackingTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-12">
        <ErrorTrackingDemo />
      </div>
    </div>
  );
}

