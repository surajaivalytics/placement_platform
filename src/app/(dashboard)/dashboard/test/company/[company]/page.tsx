import TestInterface from '@/components/test/test-interface';

export default async function CompanyTestPage({ params }: { params: Promise<{ company: string }> }) {
  const { company } = await params;
  
  // Fetch the test ID for this company
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tests?type=company`, {
    cache: 'no-store'
  });
  
  let testId = '';
  if (response.ok) {
    const data = await response.json();
    interface CompanyTest {
      id: string;
      company: string;
    }
    const companyTest = data.tests?.find((test: CompanyTest) => test.company === company);
    testId = companyTest?.id || '';
  }
  
  return <TestInterface type="id" testId={testId} />;
}
