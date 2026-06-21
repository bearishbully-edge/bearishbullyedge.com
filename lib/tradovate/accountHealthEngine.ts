export interface AccountHealth {
  healthy: boolean;

  coachNote: string;
}

export function evaluateAccountHealth(
  authenticated: boolean,
): AccountHealth {
  return {
    healthy:
      authenticated,

    coachNote:
      authenticated
        ? 'Account healthy.'
        : 'Authentication required.',
  };
}