import { KeyboardEvent } from "react";
import { SETTINGS_SECTIONS } from "./settingsSections";
import type { SettingsSection } from "./settingsTypes";

type SettingsNavigationProps = {
  activeSection: SettingsSection;
  onSelect: (section: SettingsSection) => void;
};

export default function SettingsNavigation({
  activeSection,
  onSelect,
}: SettingsNavigationProps) {
  const handleNavigationKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % SETTINGS_SECTIONS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + SETTINGS_SECTIONS.length) % SETTINGS_SECTIONS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = SETTINGS_SECTIONS.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    onSelect(SETTINGS_SECTIONS[nextIndex].id);
    document.getElementById(`settings-tab-${SETTINGS_SECTIONS[nextIndex].id}`)?.focus();
  };

  return (
    <nav className="settings-nav" aria-label="Settings sections">
      <div className="settings-tabs" role="tablist" aria-label="Settings">
        {SETTINGS_SECTIONS.map((section, index) => {
          const isActive = section.id === activeSection;

          return (
            <button
              id={`settings-tab-${section.id}`}
              key={section.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`settings-panel-${section.id}`}
              tabIndex={isActive ? 0 : -1}
              className="settings-tab"
              onClick={() => onSelect(section.id)}
              onKeyDown={(event) => handleNavigationKeyDown(event, index)}
            >
              <span className="settings-tab-number">{section.number}</span>
              <span>
                <span className="settings-tab-label">{section.label}</span>
                <span className="settings-tab-rule" aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
