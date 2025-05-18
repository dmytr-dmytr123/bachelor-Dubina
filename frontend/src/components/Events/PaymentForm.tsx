import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const PaymentForm = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const cardElement = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      toast({ variant: "destructive", title: "Payment Failed", description: error.message });
      console.error("Payment error:", error);
    } else if (paymentIntent?.status === "succeeded") {
      toast({ title: "Payment Successful", description: "Your booking is confirmed!" });
      onSuccess();
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-md space-y-5"
    >
      <h2 className="text-xl font-semibold text-gray-800">Enter your payment details</h2>

      <div className="p-4 border rounded-md bg-gray-50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#32325d",
                "::placeholder": { color: "#a0aec0" },
              },
              invalid: {
                color: "#e53e3e",
              },
            },
          }}
        />
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={loading || !stripe || !elements}>
          {loading ? "Processing..." : "Pay тow"}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
