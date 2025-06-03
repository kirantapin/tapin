import Lottie from "lottie-react";
import animationData from "./tapin-logo-full-gold-dark-zoomout.json";

const LoaderAnimation = () => {
  return <Lottie animationData={animationData} loop={true} />;
};

export default LoaderAnimation;
