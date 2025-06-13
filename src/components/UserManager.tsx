import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  login: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  active: boolean;
}

const UserManager = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Администратор",
      login: "admin",
      password: "admin",
      role: "admin",
      createdAt: new Date(),
      active: true,
    },
    {
      id: "2",
      name: "Иван Петров",
      login: "ipetrov",
      password: "user123",
      role: "user",
      createdAt: new Date(),
      active: true,
    },
    {
      id: "3",
      name: "Анна Сидорова",
      login: "asidorova",
      password: "pass456",
      role: "user",
      createdAt: new Date(),
      active: false,
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    login: "",
    password: "",
    role: "user" as "user" | "admin",
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  // Генерация случайного пароля
  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setNewUser({ ...newUser, password: newPassword });
    toast.success("Пароль сгенерирован");
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.login || !newUser.password) {
      toast.error("Заполните все поля");
      return;
    }

    if (users.some((u) => u.login === newUser.login)) {
      toast.error("Пользователь с таким логином уже существует");
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      login: newUser.login,
      password: newUser.password,
      role: newUser.role,
      createdAt: new Date(),
      active: true,
    };

    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    setNewUser({ name: "", login: "", password: "", role: "user" });
    setDialogOpen(false);
    toast.success("Пользователь добавлен");

    // Сохранение в localStorage для синхронизации
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  const handleToggleUser = (id: string) => {
    setUsers(
      users.map((user) =>
        user.id === id ? { ...user, active: !user.active } : user,
      ),
    );
    toast.success("Статус пользователя изменен");
  };

  const handleDeleteUser = (id: string) => {
    if (users.find((u) => u.id === id)?.login === "admin") {
      toast.error("Нельзя удалить администратора");
      return;
    }
    setUsers(users.filter((u) => u.id !== id));
    toast.success("Пользователь удален");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление пользователями</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Icon name="UserPlus" size={16} className="mr-2" />
              Добавить пользователя
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить нового пользователя</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userName">Полное имя</Label>
                <Input
                  id="userName"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  placeholder="Например: Иван Петров"
                />
              </div>
              <div>
                <Label htmlFor="userLogin">Логин</Label>
                <Input
                  id="userLogin"
                  value={newUser.login}
                  onChange={(e) =>
                    setNewUser({ ...newUser, login: e.target.value })
                  }
                  placeholder="Например: ipetrov"
                />
              </div>
              <div>
                <Label htmlFor="userPassword">Пароль</Label>
                <div className="flex space-x-2">
                  <Input
                    id="userPassword"
                    type="text"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="Введите пароль"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                    className="px-3"
                  >
                    <Icon name="RefreshCw" size={14} />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="userRole">Роль</Label>
                <select
                  id="userRole"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value as "user" | "admin",
                    })
                  }
                >
                  <option value="user">Пользователь</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              <Button onClick={handleAddUser} className="w-full">
                Добавить пользователя
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-4 h-4 rounded-full ${user.active ? "bg-green-500" : "bg-gray-400"}`}
                />
                <div>
                  <h3 className="font-semibold flex items-center space-x-2">
                    <span>{user.name}</span>
                    {user.role === "admin" && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        Администратор
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Логин: {user.login} • Пароль: {user.password}
                  </p>
                  <p className="text-xs text-gray-400">
                    Создан: {user.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.active ? "Активен" : "Отключен"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleUser(user.id)}
                >
                  <Icon name={user.active ? "UserX" : "UserCheck"} size={14} />
                </Button>
                {user.login !== "admin" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManager;
