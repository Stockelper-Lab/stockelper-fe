interface PageHeaderProps {
  title: string;
  description: string | React.ReactNode;
}

const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="border-b border-zinc-100 dark:border-zinc-700/50 mb-6 pb-4">
      <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
        {title}
      </h1>
      <div className="mt-1 text-sm text-zinc-400 dark:text-zinc-400">
        {description}
      </div>
    </div>
  );
};

export default PageHeader;
