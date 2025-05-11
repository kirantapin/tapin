import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  FC,
  ReactNode,
} from "react";
import { Transaction, User } from "../types";
import { supabase } from "../utils/supabase_client";
import { Session } from "@supabase/supabase-js";

// Create a context with default values (optional)
interface AuthContextProps {
  userSession: any; // Supabase session type
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchUserData(userSession?.user?.id ?? null);
    fetchTransactionData(userSession?.user?.id ?? null);
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

  // Fetch transaction data
  const fetchTransactionData = async (userId: string | null) => {
    if (!userId) {
      setTransactions([]);
      return;
    }
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const formattedDate = ninetyDaysAgo.toISOString();

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", formattedDate)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data);
    } catch (error) {
      setTransactions([]);
      console.error("Error fetching transactions:", error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
