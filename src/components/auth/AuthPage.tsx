import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Eye, EyeOff, Camera, Sparkles } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Signup form schema
const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

// Animated background particles
const BackgroundParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full bg-bb-blue/20"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }}
        animate={{
          y: [null, Math.random() * -200 - 100],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ))}
  </div>
);

// Big Brother Eye Logo
const EyeLogo = () => (
  <motion.div
    className="relative w-24 h-24 mx-auto mb-6"
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
  >
    {/* Outer ring */}
    <motion.div
      className="absolute inset-0 rounded-full border-4 border-bb-blue"
      animate={{
        boxShadow: [
          "0 0 20px hsl(var(--bb-blue) / 0.3)",
          "0 0 40px hsl(var(--bb-blue) / 0.5)",
          "0 0 20px hsl(var(--bb-blue) / 0.3)",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    
    {/* Inner gradient */}
    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-bb-blue via-primary to-bb-blue-dark" />
    
    {/* Camera/Eye icon */}
    <div className="absolute inset-0 flex items-center justify-center">
      <Camera className="w-10 h-10 text-white drop-shadow-lg" />
    </div>
    
    {/* Scan line */}
    <motion.div
      className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
      animate={{ y: [8, 80, 8] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  </motion.div>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLoginSubmit = async (data: LoginFormValues) => {
    const success = await login(data.email, data.password);
    if (success) {
      navigate("/game");
    }
  };

  const handleSignupSubmit = async (data: SignupFormValues) => {
    const success = await signup(data.username, data.email, data.password);
    if (success) {
      navigate("/game");
    }
  };
  
  const handleBypass = () => {
    localStorage.setItem('bypass-auth', 'true');
    navigate("/setup");
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-background" />
      <div className="absolute inset-0 bg-surveillance-pattern opacity-5" />
      
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-bb-blue/10 via-transparent to-transparent rounded-full" />
      
      <BackgroundParticles />
      
      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <Card className="glass-card border-border/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <EyeLogo />
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-display tracking-wider bg-gradient-to-r from-bb-blue via-primary to-bb-blue-light bg-clip-text text-transparent">
                Digital House Intrigue
              </CardTitle>
              <CardDescription className="mt-2 text-muted-foreground">
                Enter the house. Play the game. Win it all.
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="pt-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="login" className="mt-0">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="houseguest@example.com" 
                                  className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    className="bg-background/50 border-border/50 focus:border-primary transition-colors pr-10"
                                    {...field} 
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full" variant="glow">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Enter the House
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="mt-0">
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
                        <FormField
                          control={signupForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="YourHouseguestName" 
                                  className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="houseguest@example.com" 
                                  className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full" variant="glow">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Create Account
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <div className="text-xs text-muted-foreground text-center w-full">
              By continuing, you agree to our terms of service
            </div>
            <div className="w-full text-center">
              <Button variant="ghost" onClick={handleBypass} className="text-sm text-muted-foreground hover:text-foreground">
                Continue as Guest (Testing Only)
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Footer branding */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-4"
        >
          Big Brother: Digital House Intrigue • Season 1
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
