export const qrStyles = {
  container: "min-h-screen bg-black text-white p-6",
  header: "flex justify-between items-center mb-8",
  backButton: "text-white hover:text-gray-300 transition-colors",
  skipButton: "text-[#F5B14C] hover:text-[#E4A43B] transition-colors",

  title: "text-3xl font-bold mb-4",
  subtitle: "text-xl text-gray-300 mb-8",

  qrContainer:
    "aspect-square w-full max-w-xs mx-auto bg-white flex items-center justify-center mb-8 rounded-xl",
  qrCode: "w-32 h-32 text-black",

  form: "mb-8",
  label: "block text-lg mb-2",
  inputContainer: "relative",
  input:
    "w-full bg-[#2A2F45] rounded-xl p-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5B14C]",
  clearButton:
    "absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors",
  clearIcon: "w-5 h-5",
  submitButton:
    "w-full bg-[#F5B14C] text-black py-4 rounded-full text-lg font-medium mt-4 hover:bg-[#E4A43B] transition-colors",

  helpText: "text-center text-gray-400",
};
