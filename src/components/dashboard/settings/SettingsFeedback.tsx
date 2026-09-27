export default function SettingsFeedback({ message }: { message: string }) {
  if (!message) return null;

  return (
    <p className="settings-feedback" role="status" aria-live="polite">
      {message}
    </p>
  );
}
