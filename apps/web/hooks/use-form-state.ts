import { useTransition, useState, type FormEvent } from "react";

interface IEmailField {
  email?:
    | {
        errors: string[];
      }
    | undefined;
}

interface IPasswordField {
  password?:
    | {
        errors: string[];
      }
    | undefined;
}

interface INameField {
  name?:
    | {
        errors: string[];
      }
    | undefined;
}

interface IPasswordField {
  password_confirmation?:
    | {
        errors: string[];
      }
    | undefined;
}

interface IPropertie {
  properties?: (IEmailField & IPasswordField & INameField) | undefined;
}

interface FormState {
  success: boolean;
  message: string | null;
  errors: IPropertie | null;
}

interface UseFormStateProps<FormState> {
  action: (data: FormData) => Promise<FormState>;
  initialState?: FormState;
}

export function useFormState({
  action,
  initialState,
}: UseFormStateProps<FormState>) {
  const [isPending, startTransition] = useTransition();

  const [formState, setFormState] = useState(
    initialState ?? {
      success: false,
      message: null,
      errors: null,
    }
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;

    const data = new FormData(form);

    startTransition(async () => {
      const state = await action(data);

      setFormState(state);
    });

    // requestFormReset(form)
  }

  return [formState, handleSubmit, isPending] as const;
}
