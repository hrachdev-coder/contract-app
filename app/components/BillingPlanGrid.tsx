import React from "react";
import LemonSqueezyCheckoutButton from "./LemonSqueezyCheckoutButton";

type BillingPlanId = "start" | "pro" | "business";

type BillingPlan = {
  id: BillingPlanId;
  name: string;
  price: string;
  description: string;
  bestFor: string;
  contractVolume: string;
  workflowFit: string;
  badge?: string;
  featured?: boolean;
  features: string[];
};

type BillingPlanGridProps = {
  email?: string | null;
  name?: string | null;
  userId?: string | null;
  redirectPath?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
};

const BILLING_PLANS: BillingPlan[] = [
  {
    id: "start",
    name: "Start",
    price: "$9",
    description: "For solo operators sending a handful of polished contracts each month.",
    bestFor: "Best for independent freelancers and solo consultants.",
    contractVolume: "Light monthly contract volume",
    workflowFit: "Core send-review-sign flow",
    features: [
      "Contract builder and templates",
      "Email sending and e-signature flow",
      "Dashboard tracking for active deals",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    description: "For freelancers and lean agencies closing client work every week.",
    bestFor: "Best for weekly deal flow and repeatable client onboarding.",
    contractVolume: "Steady recurring contract volume",
    workflowFit: "Recommended for growing client operations",
    badge: "Most Popular",
    featured: true,
    features: [
      "Everything in Start",
      "Best fit for recurring client contracts",
      "Priority workflow for growing teams",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "$49",
    description: "For teams managing larger client volume and higher-value engagements.",
    bestFor: "Best for agencies or teams handling multiple accounts at once.",
    contractVolume: "Higher contract volume across clients",
    workflowFit: "Built for structured team-level operations",
    features: [
      "Everything in Pro",
      "Built for higher contract volume",
      "Best fit for multi-client operations",
    ],
  },
];

export default function BillingPlanGrid(props: BillingPlanGridProps) {
  return (
    <section className="pricing-section">
      <div className="pricing-head">
        <div className="section-eyebrow">Pricing</div>
        <h2 className="section-title">{props.title || <>Choose the plan that fits your <em>contract volume</em></>}</h2>
        <p className="section-sub pricing-subtitle">
          {props.subtitle || "Start small, move up when your deal flow grows, and keep the same contract workflow across every tier."}
        </p>
      </div>

      <div className="pricing-grid">
        {BILLING_PLANS.map((plan) => (
          <div key={plan.id} className={`pricing-card${plan.featured ? " pricing-card-featured" : ""}`}>
            <div className="pricing-card-top">
              <div>
                <div className="pricing-plan-name">{plan.name}</div>
                <p className="pricing-plan-description">{plan.description}</p>
              </div>
              {plan.badge ? <span className="pricing-badge">{plan.badge}</span> : null}
            </div>

            <div className="pricing-price-row">
              <span className="pricing-price">{plan.price}</span>
              <span className="pricing-price-note">/ month</span>
            </div>

            <div className="pricing-meta-grid">
              <div className="pricing-meta-card">
                <span className="pricing-meta-label">Best fit</span>
                <span className="pricing-meta-value">{plan.bestFor}</span>
              </div>
              <div className="pricing-meta-card">
                <span className="pricing-meta-label">Volume</span>
                <span className="pricing-meta-value">{plan.contractVolume}</span>
              </div>
              <div className="pricing-meta-card pricing-meta-card-wide">
                <span className="pricing-meta-label">Workflow</span>
                <span className="pricing-meta-value">{plan.workflowFit}</span>
              </div>
            </div>

            <LemonSqueezyCheckoutButton
              label={`Choose ${plan.name}`}
              className={plan.featured ? "btn-filled pricing-button" : "btn-ghost pricing-button"}
              email={props.email}
              name={props.name}
              userId={props.userId}
              planId={plan.id}
              redirectPath={props.redirectPath}
            />

            <div className="pricing-divider" />

            <ul className="pricing-feature-list">
              {plan.features.map((feature) => (
                <li key={feature} className="pricing-feature-item">
                  <span className="pricing-feature-check">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}