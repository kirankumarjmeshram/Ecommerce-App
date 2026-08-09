let razorpayScriptPromise;

const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve();

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        razorpayScriptPromise = undefined;
        reject(new Error('Unable to load Razorpay Checkout'));
      };
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
};

export default loadRazorpayScript;
