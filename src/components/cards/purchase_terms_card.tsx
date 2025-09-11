export function PurchaseTermsCard() {
  return (
    <p className="m-0">
      If purchasing alcohol or other age-restricted items, you must be 21+ and
      show a valid ID. All sales are final and subject to Tapin rules. By
      purchasing, you agree to Tapin’s{" "}
      <span
        className="underline"
        onClick={() => {
          window.open("https://go.tapin.app/terms-and-conditions", "_blank");
        }}
      >
        Terms & Conditions
      </span>{" "}
      and{" "}
      <span
        className="underline"
        onClick={() => {
          window.open("https://go.tapin.app/privacy-policy", "_blank");
        }}
      >
        Privacy Policy
      </span>
      .
    </p>
  );
}
