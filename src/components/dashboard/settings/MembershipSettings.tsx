import Link from "next/link";

const BENEFITS = [
  "Private editorial galleries",
  "Monthly live Q&A access",
  "Early access to new releases",
  "Member-only chat rooms",
];

export default function MembershipSettings() {
  return (
    <section
      id="settings-panel-membership"
      role="tabpanel"
      aria-labelledby="settings-tab-membership"
      className="settings-panel"
    >
      <div className="settings-section-heading">
        <p className="label">04 — Access</p>
        <h2>Membership</h2>
        <p>Your current place within the Midigo private community.</p>
      </div>

      <div className="settings-membership-summary">
        <div>
          <p className="label">Current tier</p>
          <p className="settings-membership-tier">Insider</p>
        </div>
        <div className="settings-membership-status">
          <span aria-hidden="true" />
          Active
        </div>
      </div>

      <dl className="settings-membership-details">
        <div>
          <dt>Renewal date</dt>
          <dd>18 October 2026</dd>
        </div>
        <div>
          <dt>Billing status</dt>
          <dd>Current</dd>
        </div>
      </dl>

      <div className="settings-benefits">
        <p className="label">Current benefits</p>
        <ul>
          {BENEFITS.map((benefit) => (
            <li key={benefit}>
              <span>{benefit}</span>
              <span aria-hidden="true">—</span>
            </li>
          ))}
        </ul>
      </div>

      <Link href="/join" className="btn btn-lime settings-action">
        Upgrade Membership
      </Link>
    </section>
  );
}
