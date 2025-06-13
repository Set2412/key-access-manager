import { useState, useEffect } from "react";
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

interface Key {
  id: string;
  name: string;
  barcode: string;
  location: string;
  available: boolean;
  takenBy?: string;
  takenAt?: Date;
}

const KeyManager = () => {
  const [keys, setKeys] = useState<Key[]>([]);
  const [newKey, setNewKey] = useState({ name: "", barcode: "", location: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<Key | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Загрузка ключей из localStorage при инициализации
  useEffect(() => {
    const savedKeys = localStorage.getItem("keys");
    if (savedKeys) {
      const parsedKeys = JSON.parse(savedKeys).map((key: any) => ({
        ...key,
        takenAt: key.takenAt ? new Date(key.takenAt) : undefined,
      }));
      setKeys(parsedKeys);
    } else {
      // Данные по умолчанию
      const defaultKeys = [
        {
          id: "1",
          name: "Офис 101",
          barcode: "123456789",
          location: "1 этаж",
          available: true,
        },
        {
          id: "2",
          name: "Склад А",
          barcode: "987654321",
          location: "Подвал",
          available: false,
          takenBy: "Иван Петров",
          takenAt: new Date(),
        },
        {
          id: "3",
          name: "Кабинет директора",
          barcode: "456789123",
          location: "2 этаж",
          available: true,
        },
      ];
      setKeys(defaultKeys);
      localStorage.setItem("keys", JSON.stringify(defaultKeys));
    }
  }, []);

  // Сохранение ключей в localStorage при изменении
  useEffect(() => {
    if (keys.length > 0) {
      localStorage.setItem("keys", JSON.stringify(keys));
    }
  }, [keys]);

  const handleAddKey = () => {
    if (!newKey.name || !newKey.barcode || !newKey.location) {
      toast.error("Заполните все поля");
      return;
    }

    // Проверка на дублирование штрих-кода
    if (keys.some((k) => k.barcode === newKey.barcode)) {
      toast.error("Ключ с таким штрих-кодом уже существует");
      return;
    }

    const key: Key = {
      id: Date.now().toString(),
      name: newKey.name,
      barcode: newKey.barcode,
      location: newKey.location,
      available: true,
    };

    setKeys([...keys, key]);
    setNewKey({ name: "", barcode: "", location: "" });
    setDialogOpen(false);
    toast.success("Ключ добавлен");

    // Сохранение в localStorage для синхронизации с пользовательским интерфейсом
    localStorage.setItem("keys", JSON.stringify([...keys, key]));
  };

  const handleReturnKey = (id: string) => {
    setKeys(
      keys.map((key) =>
        key.id === id
          ? { ...key, available: true, takenBy: undefined, takenAt: undefined }
          : key,
      ),
    );
    toast.success("Ключ возвращен");
    localStorage.setItem(
      "keys",
      JSON.stringify(
        keys.map((key) =>
          key.id === id
            ? {
                ...key,
                available: true,
                takenBy: undefined,
                takenAt: undefined,
              }
            : key,
        ),
      ),
    );
  };

  const handleDeleteKey = (id: string) => {
    const updatedKeys = keys.filter((k) => k.id !== id);
    setKeys(updatedKeys);
    toast.success("Ключ удален");
    localStorage.setItem("keys", JSON.stringify(updatedKeys));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление ключами</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить ключ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новый ключ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="keyName">Название ключа</Label>
                <Input
                  id="keyName"
                  value={newKey.name}
                  onChange={(e) =>
                    setNewKey({ ...newKey, name: e.target.value })
                  }
                  placeholder="Например: Офис 101"
                />
              </div>
              <div>
                <Label htmlFor="keyBarcode">Штрих-код</Label>
                <Input
                  id="keyBarcode"
                  value={newKey.barcode}
                  onChange={(e) =>
                    setNewKey({ ...newKey, barcode: e.target.value })
                  }
                  placeholder="Например: 123456789"
                />
              </div>
              <div>
                <Label htmlFor="keyLocation">Местоположение</Label>
                <Input
                  id="keyLocation"
                  value={newKey.location}
                  onChange={(e) =>
                    setNewKey({ ...newKey, location: e.target.value })
                  }
                  placeholder="Например: 1 этаж"
                />
              </div>
              <Button onClick={handleAddKey} className="w-full">
                Добавить ключ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {keys.map((key) => (
          <Card key={key.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-4 h-4 rounded-full ${key.available ? "bg-green-500" : "bg-red-500"}`}
                />
                <div>
                  <h3 className="font-semibold">{key.name}</h3>
                  <p className="text-sm text-gray-500">
                    Штрих-код: {key.barcode} • Локация: {key.location}
                  </p>
                  {!key.available && key.takenBy && (
                    <p className="text-sm text-orange-600">
                      Взят: {key.takenBy} ({key.takenAt?.toLocaleString()})
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    key.available
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {key.available ? "Доступен" : "Выдан"}
                </span>
                {!key.available && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReturnKey(key.id)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Icon name="RotateCcw" size={14} className="mr-1" />
                    Вернуть
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteKey(key.id)}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default KeyManager;
