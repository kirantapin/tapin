import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  FC,
  ReactNode,
} from "react";
import { Transaction, User, DealUse, UserSession } from "../types";
import { useSupabase } from "./supabase_context";
import { cleanExpiredLocalStorage } from "../utils/clean_local_storage";
import { STORAGE_TTL } from "../constants";

// Create a context with default values (optional)
interface AuthContextProps {
  userSession: UserSession | null;
  login: (userSession: UserSession) => void;
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
  // Define the state you want to share
  const [userSession, setUserSession] = useState(() => {
    // Initialize user session from local storage (if available)
    const storedUser = localStorage.getItem("userSession");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  // const [localTransactions, setLocalTransactions] = useState<Transaction[]>(
  //   () => {
  //     const storedTransactions = localStorage.getItem("localTransactions");
  //     return storedTransactions ? JSON.parse(storedTransactions) : [];
  //   }
  // );

  const supabase = useSupabase();

  const [userData, setUserData] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dealUses, setDealUses] = useState<DealUse[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    cleanExpiredLocalStorage(STORAGE_TTL);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingUser(true);
      await fetch_user_data(userSession);
      await fetch_transaction_data(userSession);
      await fetch_deal_uses(userSession);
      setLoadingUser(false);
    };
    fetchData();
  }, [userSession]);

  // useEffect(() => {
  //   localStorage.setItem(
  //     "localTransactions",
  //     JSON.stringify(localTransactions)
  //   );
  // }, [localTransactions]);

  const fetch_user_data = async (userSession: UserSession | null) => {
    if (userSession) {
      try {
        const phone = userSession.phone;
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", phone)
          .single();
        if (error) {
          console.error("Error fetching user:", error);
          setUserSession(null);
          return;
        }
        setUserData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      setUserData(null);
    }
  };

  const fetch_transaction_data = async (userSession: UserSession | null) => {
    if (userSession) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const formattedDate = ninetyDaysAgo.toISOString();
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userSession.phone)
        .gte("created_at", formattedDate)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      setTransactions(data);
    }
  };

  const fetch_deal_uses = async (userSession: UserSession | null) => {
    if (userSession) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const formattedDate = weekAgo.toISOString();
      const { data, error } = await supabase
        .from("deal_use")
        .select("*")
        .eq("user_id", userSession.phone)
        .gte("created_at", formattedDate)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setDealUses(data);
    }
  };

  const login = (userSession: UserSession) => {
    localStorage.setItem("userSession", JSON.stringify(userSession));
    setUserSession(userSession);
  };

  // Function to log out the user
  const logout = () => {
    localStorage.removeItem("userSession");
    setUserSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userSession,
        login,
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
