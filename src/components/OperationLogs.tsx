import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

interface KeyHistoryRecord {
  id: string;
  keyName: string;
  keyBarcode: string;
  action: "taken" | "returned";
  timestamp: Date;
  userName: string;
}

const OperationLogs = () => {
  const [allHistory, setAllHistory] = useState<KeyHistoryRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<KeyHistoryRecord[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadHistory = () => {
      const savedHistory = localStorage.getItem("keyHistory");
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory).map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        }));
        setAllHistory(parsedHistory);
        setFilteredHistory(parsedHistory);
      }
    };

    loadHistory();

    // Обновление при изменении localStorage
    const handleStorageChange = () => {
      loadHistory();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allHistory.filter(
        (record) =>
          record.keyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.keyBarcode.includes(searchTerm),
      );
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(allHistory);
    }
  }, [searchTerm, allHistory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon name="FileText" className="text-blue-600" />
          <span>Лог всех операций</span>
        </CardTitle>
        <div className="mt-4">
          <Input
            placeholder="Поиск по имени пользователя, ключу или штрих-коду..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm ? "Ничего не найдено" : "История операций пуста"}
            </p>
          ) : (
            filteredHistory
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        record.action === "taken"
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                    />
                    <div>
                      <h3 className="font-medium">{record.keyName}</h3>
                      <p className="text-sm text-gray-500">
                        Штрих-код: {record.keyBarcode}
                      </p>
                      <p className="text-sm text-blue-600">
                        Пользователь: {record.userName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        record.action === "taken"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {record.action === "taken" ? "Взят" : "Возвращен"}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {record.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationLogs;
