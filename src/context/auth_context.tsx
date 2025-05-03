import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  FC,
  ReactNode,
} from "react";
import { Transaction, User } from "../types";
import { useSupabase } from "./supabase_context";
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
  loadingUser: boolean;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [userSession, setUserSession] = useState<any>(null);
  const supabase = useSupabase();
  const [userData, setUserData] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  const setData = async (session: Session | null) => {
    if (!session) {
      return;
    }
    const phone = session.user.phone;
    if (!phone) {
      return;
    }
    setUserSession(session);
    fetchUserData(phone);
    fetchTransactionData(phone);
  };

  useEffect(() => {
    setLoadingUser(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setData(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoadingUser(true);
      setData(session);
      setLoadingUser(false);
    });
    setLoadingUser(false);
    return () => subscription.unsubscribe();
  }, []);

  // Fetch user data
  const fetchUserData = async (userId: string) => {
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
  const fetchTransactionData = async (userId: string) => {
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

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setUserSession(null);
    setUserData(null);
    setTransactions([]);
  };

  return (
    <AuthContext.Provider
      value={{
        userSession,
        login: () => {}, // Login is handled automatically by Supabase
        logout,
        userData,
        setUserData,
        transactions,
        setTransactions,
        loadingUser,
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
