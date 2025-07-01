"use client";
import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface Ticket {
  id: string;
  studentID: string;
  name: string;
  checkInStatus: boolean;
}

export default function QrcodeCheckin() {
  const [input, setInput] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const handleSearch = async (searchValue?: string) => {
    setLoading(true);
    setResult("");
    setTicket(null);
    try {
      const res = await fetch("/api/e-ticket");
      const data = await res.json();
      const search = (searchValue ?? input).toLowerCase();
      const found = data.tickets.find(
        (t: Ticket) =>
          t.id?.toLowerCase() === search ||
          t.studentID?.toLowerCase() === search ||
          t.name?.toLowerCase().includes(search)
      );
      if (!found) {
        setResult("ไม่พบข้อมูลตั๋ว");
      } else {
        setTicket(found);
        setResult("");
      }
    } catch {
      setResult("เกิดข้อผิดพลาด");
    }
    setLoading(false);
  };

  const handleCheckin = async () => {
    if (!ticket?.id) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/e-ticket-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ticket.id }), 
      });
      const data = await res.json();
      if (res.ok) {
        setResult("เช็คอินสำเร็จ");
        setTicket({ ...ticket, checkInStatus: true });
      } else {
        setResult(data.error || "เช็คอินไม่สำเร็จ");
      }
    } catch {
      setResult("เกิดข้อผิดพลาด");
    }
    setLoading(false);
  };

  const startScan = async () => {
    setScanning(true);
    setResult("");
    setTicket(null);
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
    }
    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        (decodedText: string) => {
          setScanning(false);
          if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop();
          }
          setInput(decodedText);
          handleSearch(decodedText);
        },
        () => {
        }
      );
    } catch{
      setResult("ไม่สามารถเข้าถึงกล้องได้");
      setScanning(false);
    }
  };


  const stopScan = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop();
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto py-10 text-black">
      <h1 className="text-2xl font-bold mb-6">เช็คอินด้วย QR หรือค้นหาด้วยข้อมูล</h1>
      <div className="mb-4">
        <input
          className="border rounded-lg p-3 w-full"
          placeholder="กรอก Ticket ID, ชื่อ, หรือรหัสนักศึกษา หรือสแกน QR"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          disabled={loading || scanning}
        />
        <button
          className="mt-2 bg-blue-700 text-white px-4 py-2 rounded-lg"
          onClick={() => handleSearch()}
          disabled={loading || scanning}
        >
          ค้นหา
        </button>
      </div>
      <div className="mb-4">
        <button
          className={`bg-amber-500 text-white px-4 py-2 rounded-lg ${scanning ? "opacity-50" : ""}`}
          onClick={startScan}
          disabled={scanning}
        >
          {scanning ? "กำลังสแกน..." : "สแกน QR Code"}
        </button>
        {scanning && (
          <button
            className="ml-2 bg-gray-400 text-white px-4 py-2 rounded-lg"
            onClick={stopScan}
          >
            หยุดสแกน
          </button>
        )}
        <div id="qr-reader" className="mt-4" style={{ width: 300, height: 300 }} />
      </div>
      {result && <div className="mb-4 text-red-600">{result}</div>}
      {ticket && (
        <div className="border rounded-lg p-4 bg-gray-50 mb-4">
          <div>ชื่อ: <b>{ticket.name}</b></div>
          <div>รหัสนักศึกษา: {ticket.studentID}</div>
          <div>Ticket ID: {ticket.id}</div>
          <div>สถานะ: {ticket.checkInStatus ? "เช็คอินแล้ว" : "ยังไม่เช็คอิน"}</div>
          {!ticket.checkInStatus && (
            <button
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg"
              onClick={handleCheckin}
              disabled={loading}
            >
              ยืนยันเช็คอิน
            </button>
          )}
        </div>
      )}
    </div>
  );
}