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
  cardCode?: string; // Код карты сотрудника
}

const UserManager = () => {
  // Инициализация пользователей из localStorage или дефолтные данные
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem("users");
    if (savedUsers) {
      try {
        return JSON.parse(savedUsers).map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
        }));
      } catch (error) {
        console.error("Ошибка при загрузке пользователей:", error);
      }
    }

    // Дефолтные пользователи, если нет сохраненных
    const defaultUsers = [
      {
        id: "1",
        name: "Администратор",
        login: "admin",
        password: "admin",
        role: "admin" as const,
        createdAt: new Date(),
        active: true,
      },
      {
        id: "2",
        name: "Иван Петров",
        login: "ipetrov",
        password: "user123",
        role: "user" as const,
        createdAt: new Date(),
        active: true,
      },
      {
        id: "3",
        name: "Анна Сидорова",
        login: "asidorova",
        password: "pass456",
        role: "user" as const,
        createdAt: new Date(),
        active: false,
      },
    ];

    // Сохраняем дефолтные данные в localStorage
    localStorage.setItem("users", JSON.stringify(defaultUsers));
    return defaultUsers;
  });

  const [newUser, setNewUser] = useState({
    name: "",
    login: "",
    password: "",
    role: "user" as "user" | "admin",
    cardCode: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

    if (
      newUser.cardCode &&
      users.some((u) => u.cardCode === newUser.cardCode)
    ) {
      toast.error("Пользователь с таким кодом карты уже существует");
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
      cardCode: newUser.cardCode || undefined,
    };

    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    setNewUser({
      name: "",
      login: "",
      password: "",
      role: "user",
      cardCode: "",
    });
    setDialogOpen(false);
    toast.success("Пользователь добавлен");

    // Сохранение в localStorage для синхронизации
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  const handleToggleUser = (id: string) => {
    const updatedUsers = users.map((user) =>
      user.id === id ? { ...user, active: !user.active } : user,
    );
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    toast.success("Статус пользователя изменен");
  };

  const handleDeleteUser = (id: string) => {
    if (users.find((u) => u.id === id)?.login === "admin") {
      toast.error("Нельзя удалить администратора");
      return;
    }
    const updatedUsers = users.filter((u) => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    toast.success("Пользователь удален");
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser?.name || !editingUser?.login) {
      toast.error("Заполните все поля");
      return;
    }

    if (
      users.some(
        (u) => u.login === editingUser.login && u.id !== editingUser.id,
      )
    ) {
      toast.error("Пользователь с таким логином уже существует");
      return;
    }

    if (
      editingUser.cardCode &&
      users.some(
        (u) => u.cardCode === editingUser.cardCode && u.id !== editingUser.id,
      )
    ) {
      toast.error("Пользователь с таким кодом карты уже существует");
      return;
    }

    const updatedUsers = users.map((user) =>
      user.id === editingUser.id ? editingUser : user,
    );
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setEditDialogOpen(false);
    setEditingUser(null);
    toast.success("Пользователь обновлен");
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
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
              <div>
                <Label htmlFor="userCardCode">Код карты сотрудника</Label>
                <Input
                  id="userCardCode"
                  value={newUser.cardCode}
                  onChange={(e) =>
                    setNewUser({ ...newUser, cardCode: e.target.value })
                  }
                  placeholder="Например: EMP001"
                />
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
                    {user.cardCode && ` • Карта: ${user.cardCode}`}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditUser(user)}
                >
                  <Icon name="Edit" size={14} />
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

      {/* Диалог редактирования пользователя */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editUserName">Полное имя</Label>
                <Input
                  id="editUserName"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  placeholder="Например: Иван Петров"
                />
              </div>
              <div>
                <Label htmlFor="editUserLogin">Логин</Label>
                <Input
                  id="editUserLogin"
                  value={editingUser.login}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, login: e.target.value })
                  }
                  placeholder="Например: ipetrov"
                />
              </div>
              <div>
                <Label htmlFor="editUserPassword">Пароль</Label>
                <Input
                  id="editUserPassword"
                  type="text"
                  value={editingUser.password}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, password: e.target.value })
                  }
                  placeholder="Введите пароль"
                />
              </div>
              <div>
                <Label htmlFor="editUserCardCode">Код карты сотрудника</Label>
                <Input
                  id="editUserCardCode"
                  value={editingUser.cardCode || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, cardCode: e.target.value })
                  }
                  placeholder="Например: EMP001"
                />
              </div>
              <div>
                <Label htmlFor="editUserActive">Статус</Label>
                <select
                  id="editUserActive"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={editingUser.active ? "active" : "inactive"}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      active: e.target.value === "active",
                    })
                  }
                >
                  <option value="active">Активен</option>
                  <option value="inactive">Отключен</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleUpdateUser} className="flex-1">
                  Сохранить
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManager;
