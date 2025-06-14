import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  FC,
  ReactNode,
  useRef,
} from "react";
import { Transaction, User } from "../types";
import { project_ref, supabase } from "../utils/supabase_client";
import { Session } from "@supabase/supabase-js";
import { TransactionUtils } from "@/utils/transaction_utils";
// import { useTabVisibilityRefresh } from "@/hooks/useTabVisibilityRefresh";

interface AuthContextProps {
  userSession: Session | null;
  login: () => void;
  logout: () => void;
  userData: User | null;
  setUserData: React.Dispatch<React.SetStateAction<User | null>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[] | []>>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const refreshSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const { data: user, error } = await supabase.auth.getUser();

    if (!user || error) {
      clearSessionState();
    } else if (session?.access_token !== userSession?.access_token) {
      setUserSession(session);
    }
  };
  // useTabVisibilityRefresh(refreshSession, 15000);

  useEffect(() => {
    refreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
      if (!session) {
        clearSessionState();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const lastFetchedUserId = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = userSession?.user?.id ?? null;
    if (lastFetchedUserId.current === currentUserId) return;

    lastFetchedUserId.current = currentUserId;

    fetchUserData(currentUserId);
    TransactionUtils.fetchTransactionData(currentUserId).then(setTransactions);
  }, [userSession]);

  // Fetch user data
  const fetchUserData = async (userId: string | null) => {
    if (!userId) {
      setUserData(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      clearSessionState();
    }
  };

  const clearSessionState = () => {
    setUserSession(null);
    setUserData(null);
    setTransactions([]);
    lastFetchedUserId.current = null;
    localStorage.removeItem(`sb-${project_ref}-auth-token`);
  };

  return (
    <AuthContext.Provider
      value={{
        userSession,
        login: () => {},
        logout,
        userData,
        setUserData,
        transactions,
        setTransactions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
