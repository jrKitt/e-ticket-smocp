"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const groupLabels = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"
];
const groupCount = 10;

const wheelColors = [
  "#2467f6", 
  "#00225a", 
];

const majorMap = {
  cs: "วิทยาการคอมพิวเตอร์",
  it: "เทคโนโลยีสารสนเทศ",
  gis: "ภูมิสารสนเทศศาสตร์",
  ai: "ปัญญาประดิษฐ์",
  cy: "ความมั่นคงปลอดภัยไซเบอร์",
};

export default function Home() {
  // 1. กำหนด state เริ่มต้นแบบปกติ
  const [currentStep, setCurrentStep] = useState("checkStudent");
  const [studentID, setStudentID] = useState("");
  const [fullName, setFullName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [foodType, setFoodType] = useState("อาหารทั่วไป");
  const [group, setGroup] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [studentStatus, setStudentStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [ticketId, setTicketId] = useState("");

  // 2. โหลดค่าจาก localStorage หลัง mount (client-only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentStep(localStorage.getItem("currentStep") || "checkStudent");
      setStudentID(localStorage.getItem("studentID") || "");
      setFullName(localStorage.getItem("fullName") || "");
      setFaculty(localStorage.getItem("faculty") || "");
      setFoodType(localStorage.getItem("foodType") || "อาหารทั่วไป");
      setGroup(localStorage.getItem("group") || null);
      setRegistrationComplete(localStorage.getItem("registrationComplete") === "true");
      setTicketId(localStorage.getItem("ticketId") || "");
    }
  }, []);

  // 3. sync state กับ localStorage ตามเดิม (ใน useEffect)
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("currentStep", currentStep); }, [currentStep]);
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("studentID", studentID); }, [studentID]);
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("fullName", fullName); }, [fullName]);
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("faculty", faculty); }, [faculty]);
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("foodType", foodType); }, [foodType]);
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("group", group ?? ""); }, [group]);
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("registrationComplete", registrationComplete ? "true" : "false"); }, [registrationComplete]);
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("ticketId", ticketId); }, [ticketId]);

  useEffect(() => {
    if (registrationComplete && !ticketId) {
      const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
      setTicketId(`CPFRESHY-${randomId}`);
    }
  }, [registrationComplete, ticketId]);

  // --- Handler Functions ---
  const handleCheckStudentID = async () => {
    if (studentID.trim() === "") return;
    setLoading(true);
    setFullName("");
    setFaculty("");
    setStudentStatus(null);

    try {
      const res = await fetch("/api/student-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ StudentID: studentID }),
      });
      const data = await res.json();

      if (res.ok && data.students && data.students.length > 0) {
        const student = data.students[0];
        setStudentStatus(0); 
        setFullName(student.StudentName || "");
        setFaculty(
          majorMap[(student.StudentMajor as keyof typeof majorMap)] ||
          student.StudentMajor ||
          ""
        );
        setCurrentStep("personalInfo");
      } else {
        toast.error("ไม่พบข้อมูล");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
    setLoading(false);
  };

  const handleSubmitPersonalInfo = () => {
    if (fullName.trim() !== "" && faculty.trim() !== "") {
      setCurrentStep("confirm");
    }
  };

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);

    const selectedIndex = Math.floor(Math.random() * groupCount);

    const extraRotation = 2 * 360 + Math.floor(Math.random() * 3) * 360;
    const sliceDegrees = 360 / groupCount;
    const targetRotation =
      extraRotation + selectedIndex * sliceDegrees + sliceDegrees / 2;

    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setGroup(groupLabels[selectedIndex]); 
    }, 5000);
  };

  const handleConfirmRegistration = async () => {
    let newTicketId = ticketId;
    if (!newTicketId) {
      newTicketId = `CPFRESHY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setTicketId(newTicketId);
    }
    try {
      const payload = {
        id: newTicketId,
        studentID,
        name: fullName,
        faculty,
        foodType,
        group,
        registeredAt: new Date().toISOString(),
        checkInStatus: false,
      };
      const res = await fetch("/api/e-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("ยืนยันข้อมูลสำเร็จ!");
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาดในการยืนยันข้อมูล");
      }
      setRegistrationComplete(true);
      setCurrentStep("ticket");
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return date.toLocaleDateString('th-TH', options);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-15">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <header className="mb-6">
          <div className="flex items-center justify-center">
            <Image src="/SMOLOGO.webp" alt="Logo" width={48} height={48} className="h-12 mr-3" priority />
            <div>
              <h1 className="text-2xl font-bold text-blue-800">ระบบลงทะเบียน</h1>
              <p className="text-sm text-gray-600">กิจกรรมรับน้องและเปิดโลก CP</p>
            </div>
          </div>
        </header>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden text-black">
          {currentStep === "checkStudent" && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">กรอกข้อมูลในการลงทะเบียน</h2>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700">ตรวจสอบรหัสนักศึกษา</h3>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="รหัสนักศึกษา"
                    value={studentID}
                    onChange={(e) => setStudentID(e.target.value)}
                  />
                  <button
                    className="absolute right-2 top-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-1 rounded-lg transition-all"
                    onClick={handleCheckStudentID}
                    disabled={loading}
                  >
                    {loading ? "กำลังตรวจสอบ..." : "ตรวจสอบ"}
                  </button>
                </div>
                <p className="text-sm text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  กรอกรหัสนักศึกษา เช่น 673040123-4
                </p>
              </div>
            </div>
          )}

          {currentStep === "personalInfo" && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">กรอกข้อมูลส่วนตัว</h2>
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500 mb-6">
                <p className="text-sm text-gray-700">
                  ข้อมูลในการลงทะเบียนจะถูกนำมาใช้ในการจัดกิจกรรม รวมถึงส่งข้อมูล
                  ให้กับหน่วยปฐมพยาบาลเพื่อการดูแลอย่างใกล้ชิด
                </p>
                <p className="text-blue-600 text-sm mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  นโยบายความเป็นส่วนตัว
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    ชื่อและนามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 mb-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="กรอกชื่อและนามสกุล"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={studentStatus === 0}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    หลักสูตร <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-3 mb-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="หลักสูตร"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      required
                      disabled={studentStatus === 0}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    ประเภทอาหาร
                  </label>
                  <div className="relative">
                    <select
                      className="w-full border border-gray-300 rounded-lg p-3 mb-1 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                      value={foodType}
                      onChange={(e) => setFoodType(e.target.value)}
                    >
                      <option value="อาหารทั่วไป">อาหารทั่วไป</option>
                      <option value="อาหารเจ">อาหารเจ</option>
                      <option value="อาหารมุสลิม">อาหารมุสลิม</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  className="text-blue-600 hover:text-blue-800 flex items-center transition"
                  onClick={() => setCurrentStep("checkStudent")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  ย้อนกลับ
                </button>
                <button
                  className={`px-6 py-2 rounded-lg transition-all ${
                    fullName && faculty
                      ? "bg-blue-700 hover:bg-blue-800 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!fullName || !faculty}
                  onClick={handleSubmitPersonalInfo}
                >
                  ถัดไป
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {currentStep === "confirm" && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
                ยืนยันข้อมูลและสุ่มกลุ่ม
              </h2>

              <div className="bg-gray-50 p-5 rounded-lg mb-6 border border-gray-100">
                <h3 className="font-medium mb-4 text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  ข้อมูลการลงทะเบียน
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">รหัสนักศึกษา:</span>
                    <span className="font-medium text-gray-800">{studentID || "ยังไม่มีรหัสนักศึกษา"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">ชื่อ-นามสกุล:</span>
                    <span className="font-medium text-gray-800">{fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">หลักสูตร:</span>
                    <span className="font-medium text-gray-800">{faculty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ประเภทอาหาร:</span>
                    <span className="font-medium text-gray-800">{foodType}</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-lg font-medium mb-4 text-gray-700">สุ่มกลุ่มกิจกรรม</h3>
                
                {/* วงล้อ */}
                <div className="relative w-64 h-64 mx-auto mb-6">
                  <div
                    className="w-full h-full rounded-full relative overflow-hidden border-8 border-blue-900 shadow-lg"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning
                        ? "transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                        : "none",
                    }}
                  >
                    {Array.from({ length: groupCount }).map((_, index) => (
                      <div
                        key={index}
                        className="absolute w-full h-full origin-center"
                        style={{
                          transform: `rotate(${index * (360 / groupCount)}deg)`,
                          clipPath:
                            "polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)",
                          backgroundColor:
                            wheelColors[index % wheelColors.length],
                        }}
                      >
                        <div
                          className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white font-bold"
                          style={{
                            transform: `translateX(30px) rotate(${
                              90 + 360 / groupCount / 2
                            }deg)`,
                          }}
                        >
                          {groupLabels[index]}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 0L30 30H0L15 0Z" fill="#FF5252"/>
                    </svg>
                  </div>
                </div>

                {group && !isSpinning && (
                  <div className="mb-4 bg-blue-50 p-3 rounded-lg inline-block">
                    <p className="font-bold text-xl text-blue-800">
                      คุณได้อยู่กลุ่ม <span className="text-blue-600">{group}</span>
                    </p>
                  </div>
                )}

                {/* ปุ่มสุ่ม */}
                <div>
                  <button
                    className={`px-6 py-3 rounded-lg ${
                      isSpinning
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-600"
                    } text-white font-medium transition-all shadow-md`}
                    onClick={spinWheel}
                    disabled={isSpinning}
                  >
                    {isSpinning ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังสุ่ม...
                      </span>
                    ) : group ? (
                      "สุ่มใหม่"
                    ) : (
                      "สุ่มกลุ่ม"
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between mt-4 border-t border-gray-100 pt-4">
                <button
                  className="text-blue-600 hover:text-blue-800 flex items-center transition"
                  onClick={() => setCurrentStep("personalInfo")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  ย้อนกลับ
                </button>
                <button
                  className={`px-6 py-2 rounded-lg ${
                    group
                      ? "bg-blue-700 hover:bg-blue-800 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  } transition-all`}
                  disabled={!group}
                  onClick={handleConfirmRegistration}
                >
                  ยืนยันการลงทะเบียน
                </button>
              </div>
            </div>
          )}

          {/* ตั๋วเข้างาน */}
          {currentStep === "ticket" && (
            <div className="animate-fadeIn">
              <div className="max-w-md mx-auto rounded-xl overflow-hidden shadow-2xl">
                {/* ส่วนหัว */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-5 relative">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
                      {Array.from({ length: 100 }).map((_, i) => (
                        <div key={i} className="border-[0.5px] border-white/20"></div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <h2 className="text-xl font-bold text-center text-white">กิจกรรมรับน้องและเปิดโลก CP</h2>
                    <div className="flex items-center justify-center mt-1">
                      <div className="h-0.5 w-10 bg-blue-300 mr-3"></div>
                      <p className="text-center text-blue-100 text-sm">วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น</p>
                      <div className="h-0.5 w-10 bg-blue-300 ml-3"></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white px-6 py-5 border-b border-dashed border-gray-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{fullName}</h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                        </svg>
                        <span>รหัสนักศึกษา: {studentID}</span>
                      </p>
                    </div>
                    
                    <div className="bg-blue-700 rounded-full w-14 h-14 flex items-center justify-center text-white font-bold text-xl">
                      {group}
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">หลักสูตร</p>
                      <p className="text-sm font-medium text-gray-800">{faculty}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">ประเภทอาหาร</p>
                      <p className="text-sm font-medium text-gray-800">{foodType}</p>
                    </div>
                  </div>
                </div>
                
                {/* ส่วน QR Code */}
                <div className="bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-3/5">
                      <div className="flex items-center space-x-2 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-800">10-11 กรกฎาคม 2567</p>
                          <p className="text-xs text-gray-500">08:30 - 16:30 น.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-800">อาคาร SC.09 อาคารวิทยวิภาส</p>
                          <p className="text-xs text-gray-500">มหาวิทยาลัยขอนแก่น</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-4">Ticket ID: {ticketId}</p>
                    </div>
                    
                    <div className="w-2/5">
                      <div className="p-2 bg-white border-2 border-blue-100 rounded-lg shadow-sm">
                        <QRCode
                          value={`CPFRESHY-${studentID}-${group}`}
                          size={120}
                          level="M"
                          className="w-full h-full"
                        />
                      </div>
                      <p className="text-center text-xs mt-1 text-gray-500">แสกนเพื่อเข้างาน</p>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
                      <p className="text-sm text-gray-700">กรุณานำตั๋วนี้มาแสดงในวันงาน</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-4">ลงทะเบียนเมื่อ: {formatDate(new Date())}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3 max-w-md mx-auto">
                <button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  บันทึกตั๋ว
                </button>
                <button className="flex-1 border-2 border-blue-600 text-blue-700 py-3 rounded-lg text-sm font-medium hover:bg-blue-50 transition-all flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  แชร์ตั๋ว
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      {/* Footer */}
      <footer className="mt-10 pb-6 text-center text-gray-500 text-sm">
        <h5 className="fw-bold">STUDENT UNION | College Of Computing</h5>
            <p className="small mb-1">สโมสรนักศึกษาวิทยาลัยการคอมพิวเตอร์</p>
            <p className="small mb-2">วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น</p>

            <p className="small text-secondary mb-0">&copy; 2025 CP SHOP. All rights reserved.</p>
      </footer>
    </div>
  );
}