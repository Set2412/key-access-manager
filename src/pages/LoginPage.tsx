import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Icon from "@/components/ui/icon";

const LoginPage = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Загружаем пользователей из localStorage
    const savedUsers = localStorage.getItem("users");
    const users = savedUsers
      ? JSON.parse(savedUsers)
      : [
          {
            login: "admin",
            password: "admin",
            role: "admin",
            name: "Администратор",
          },
        ];

    // Проверка авторизации
    const user = users.find(
      (u: any) => u.login === login && u.password === password,
    );

    if (user) {
      if (user.role === "admin") {
        toast.success("Добро пожаловать, администратор!");
        navigate("/admin");
      } else {
        sessionStorage.setItem("currentUser", user.name);
        toast.success(`Добро пожаловать, ${user.name}!`);
        navigate("/user");
      }
    } else {
      toast.error("Неверный логин или пароль");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Icon name="Key" size={32} className="text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Система управления ключами
          </CardTitle>
          <CardDescription>
            Войдите в систему для доступа к управлению ключами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Введите логин"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium mb-2">Демо доступы:</p>
            <p>• Администратор: admin / admin</p>
            <p>• Пользователь: любой логин/пароль</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
