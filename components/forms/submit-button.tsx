"use client";

import { useFormStatus } from "react-dom";
import { type ComponentProps } from "react";

type Props = ComponentProps<"button"> & {
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  ...props
}: Props) {
  const { pending, action } = useFormStatus();

  const isPending = pending && action === props.formAction;

  return (
    <button
      {...props}
      className="bg-[#BFDFFD] h-12 flex items-center justify-center font-semibold text-lg hover:bg-[#2871E6] transition-colors text-white rounded-xl text-foreground"
      type="submit"
      aria-disabled={pending}
    >
      {isPending ? pendingText : children}
    </button>
  );
}
