import { FormValidationErrors } from "@/lib/models/form";

export const inputClassName = 
  "w-full p-4 border-2 border-tathir-brown rounded-xl bg-tathir-cream text-tathir-maroon placeholder-tathir-maroon/60 focus:outline-none focus:border-tathir-light-green focus:bg-white focus:shadow-lg transition-all duration-300 transform hover:scale-105 focus:scale-105";

export const inputErrorClassName = 
  "w-full p-4 border-2 border-tathir-error rounded-xl bg-tathir-cream text-tathir-maroon placeholder-tathir-maroon/60 focus:outline-none focus:border-tathir-error focus:bg-white focus:shadow-lg transition-all duration-300 animate-pulse";

export const selectClassName = 
  "w-full p-4 border-2 border-tathir-brown rounded-xl bg-tathir-cream text-tathir-maroon focus:outline-none focus:border-tathir-light-green focus:bg-white focus:shadow-lg transition-all duration-300 transform hover:scale-105 focus:scale-105 cursor-pointer";

export const selectErrorClassName = 
  "w-full p-4 border-2 border-tathir-error rounded-xl bg-tathir-cream text-tathir-maroon focus:outline-none focus:border-tathir-error focus:bg-white focus:shadow-lg transition-all duration-300 animate-pulse cursor-pointer";

export const textareaClassName = 
  "w-full p-4 border-2 border-tathir-brown rounded-xl bg-tathir-cream text-tathir-maroon placeholder-tathir-maroon/60 focus:outline-none focus:border-tathir-light-green focus:bg-white focus:shadow-lg transition-all duration-300 transform hover:scale-105 focus:scale-105 resize-vertical min-h-[120px] tathir-scrollbar";

export const textareaErrorClassName = 
  "w-full p-4 border-2 border-tathir-error rounded-xl bg-tathir-cream text-tathir-maroon placeholder-tathir-maroon/60 focus:outline-none focus:border-tathir-error focus:bg-white focus:shadow-lg transition-all duration-300 animate-pulse resize-vertical min-h-[120px] tathir-scrollbar";

export const getFieldClassName = (
  fieldName: string,
  baseClassName: string,
  errorClassName: string,
  errors: FormValidationErrors
): string => {
  return errors[fieldName] ? errorClassName : baseClassName;
};

export const buttonClassName = "tathir-card-hover bg-tathir-light-green text-tathir-maroon px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2";

export const secondaryButtonClassName = "tathir-card-hover bg-tathir-brown text-tathir-cream px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-tathir-cream hover:text-tathir-maroon transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2";

export const labelClassName = "block text-tathir-cream mb-3 font-semibold text-lg flex items-center gap-2";

export const errorMessageClassName = "text-tathir-error text-sm mt-2 flex items-center gap-1 animate-pulse-soft";

export const fieldContainerClassName = "transform hover:scale-[1.02] transition-transform duration-200";

export const checkboxClassName = "w-5 h-5 text-tathir-light-green bg-tathir-cream border-2 border-tathir-brown rounded focus:ring-tathir-light-green focus:ring-2 transition-all duration-200 hover:scale-110";

export const radioClassName = "w-5 h-5 text-tathir-light-green bg-tathir-cream border-2 border-tathir-brown focus:ring-tathir-light-green focus:ring-2 transition-all duration-200 hover:scale-110";
