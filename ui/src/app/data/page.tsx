import DataSource from '@/components/DataSource';
import FormulaBar from '@/components/FormulaBar';

export default function Home() {
  return (
    <>
      <FormulaBar />

      <div className='p-16'>
        <DataSource />
        <DataSource />
        <DataSource />
        <DataSource />
        <DataSource />
        <DataSource />
        <DataSource />
        <DataSource />
        <DataSource />
        <DataSource />
      </div>
    </>
  );
}
