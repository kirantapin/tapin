import LoaderAnimation from "../svg/loader_animation";

const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center h-[85vh]">
      <div className="w-64">
        <LoaderAnimation />
      </div>
    </div>
  );
};

export default LoadingPage;
