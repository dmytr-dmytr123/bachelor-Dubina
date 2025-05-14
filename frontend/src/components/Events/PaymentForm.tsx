import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const PaymentForm = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

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
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <Button type="submit" className="mt-4">
        pay now
      </Button>
    </form>
  );
};

export default PaymentForm;
