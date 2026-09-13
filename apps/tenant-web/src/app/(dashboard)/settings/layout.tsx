export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col space-y-6">
      {children}
    </div>
  );
}
