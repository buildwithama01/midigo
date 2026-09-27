export default function AdminTabs({
  ariaLabel,
  onChange,
  tabs,
  value,
}: {
  ariaLabel: string;
  onChange: (value: string) => void;
  tabs: string[];
  value: string;
}) {
  return (
    <div aria-label={ariaLabel} className="admin-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          aria-selected={value === tab}
          className={`admin-tab ${value === tab ? "admin-tab-active" : ""}`}
          key={tab}
          onClick={() => onChange(tab)}
          role="tab"
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
