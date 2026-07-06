import { PanelPageHeader } from "@/components/layout/PanelLayout";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function AdminPageHeader({
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return <PanelPageHeader title={title} description={description} action={action} />;
}
