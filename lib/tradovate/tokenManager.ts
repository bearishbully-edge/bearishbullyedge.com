import type {
  TradovateAuthSession,
} from './authSession';

let session:
  TradovateAuthSession | null =
  null;

export function getSession() {
  return session;
}

export function setSession(
  value: TradovateAuthSession,
) {
  session = value;
}

export function sessionExpired() {
  if (!session) {
    return true;
  }

  return (
    Date.now() >=
    session.expiresAt
  );
}