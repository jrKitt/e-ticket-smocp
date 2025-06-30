"use client";
import { useState } from "react";

const groupLabels = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"
];
const groupCount = 10;

const wheelColors = [
  "#2467f6", 
  "#00225a", 
];


const majorMap: Record<string, string> = {
  cs: "วิทยาการคอมพิวเตอร์",
  it: "เทคโนโลยีสารสนเทศ",
  gis: "ภูมิสารสนเทศศาสตร์",
  ai: "ปัญญาประดิษฐ์",
  cy: "ความมั่นคงปลอดภัยไซเบอร์",
};

export default function Home() {
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

  // ดึงข้อมูลจาก Firebase API
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
        // สมมติ status = 0 ให้กรอกอัตโนมัติ
        setStudentStatus(0); // หรือแก้ตาม field จริงถ้ามี
        setFullName(student.StudentName || "");
        setFaculty(
          majorMap[student.StudentMajor] ||
          student.StudentMajor ||
          ""
        );
        setCurrentStep("personalInfo");
      } else {
        alert(data.error || "ไม่พบข้อมูลนักศึกษา");
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
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
    setGroup(groupLabels[selectedIndex]);

    const extraRotation = 2 * 360 + Math.floor(Math.random() * 3) * 360;
    const sliceDegrees = 360 / groupCount;
    const targetRotation =
      extraRotation + selectedIndex * sliceDegrees + sliceDegrees / 2;

    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
    }, 5000);
  };

  const handleConfirmRegistration = () => {
    alert(`ลงทะเบียนสำเร็จ! คุณได้อยู่กลุ่ม ${group}`);
  };

  return (
    <div className="min-h-screen bg-white text-white">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white p-6 text-gray-800">
          {currentStep === "checkStudent" && (
            <div>
              <h2 className="text-xl font-bold mb-6">กรอกข้อมูลในการลงทะเบียน</h2>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">ตรวจสอบรหัสนักศึกษา</h3>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 mb-2"
                    placeholder="รหัสนักศึกษา"
                    value={studentID}
                    onChange={(e) => setStudentID(e.target.value)}
                  />
                  <button
                    className="absolute right-2 top-2 bg-gray-800 text-white px-4 py-1 rounded-lg"
                    onClick={handleCheckStudentID}
                    disabled={loading}
                  >
                    {loading ? "กำลังตรวจสอบ..." : "ตรวจสอบ"}
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  กรอกรหัสนักศึกษา เช่น 673040123-4
                </p>
              </div>
            </div>
          )}

          {currentStep === "personalInfo" && (
            <div>
              <h2 className="text-xl font-bold mb-6">กรอกข้อมูลส่วนตัว</h2>
              <p className="text-sm text-gray-600 mb-4">
                * ข้อมูลในการลงทะเบียนจะถูกนำมาใช้ในการจัดกิจกรรม รวมถึงส่งข้อมูล
                ให้กับหน่วยปฐมพยาบาลเพื่อการดูแลอย่างใกล้ชิด
              </p>
              <p className="text-blue-600 text-sm mb-6">นโยบายความเป็นส่วนตัว</p>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  ชื่อและนามสกุล *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 mb-1"
                  placeholder="กรอกชื่อและนามสกุล"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={studentStatus === 0}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  หลักสูตร *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 mb-1"
                    placeholder="หลักสูตร"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    required
                    disabled={studentStatus === 0}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  ประเภทอาหาร
                </label>
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-lg p-3 mb-1 appearance-none"
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                  >
                    <option value="อาหารทั่วไป">อาหารทั่วไป</option>
                    <option value="อาหารเจ">อาหารเจ</option>
                    <option value="อาหารมุสลิม">อาหารมุสลิม</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  className="text-blue-600"
                  onClick={() => setCurrentStep("checkStudent")}
                >
                  ย้อนกลับ
                </button>
                <button
                  className={`px-6 py-2 rounded-md ${
                    fullName && faculty
                      ? "bg-blue-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!fullName || !faculty}
                  onClick={handleSubmitPersonalInfo}
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}

          {currentStep === "confirm" && (
            <div>
              <h2 className="text-xl font-bold mb-6 text-center">
                ยืนยันข้อมูลและสุ่มกลุ่ม
              </h2>

              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-3">ข้อมูลการลงทะเบียน</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">รหัสนักศึกษา:</span>
                    <span>{studentID || "ยังไม่มีรหัสนักศึกษา"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ชื่อ-นามสกุล:</span>
                    <span>{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">คณะ:</span>
                    <span>{faculty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ประเภทอาหาร:</span>
                    <span>{foodType}</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-lg font-medium mb-4">สุ่มกลุ่มกิจกรรม</h3>
                {/* วงล้อ */}
                <div className="relative w-64 h-64 mx-auto mb-4">
                  <div
                    className="w-full h-full rounded-full relative overflow-hidden"
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
                  {/* ตัวชี้ */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
                    <div className="w-4 h-8 bg-white"></div>
                  </div>
                </div>

                {/* ผลลัพธ์ */}
                {group && !isSpinning && (
                  <div className="mb-4">
                    <p className="font-bold text-xl">
                      คุณได้อยู่กลุ่ม{" "}
                      <span className="text-blue-600">{group}</span>
                    </p>
                  </div>
                )}

                {/* ปุ่มสุ่ม */}
                <button
                  className={`px-6 py-2 rounded-md ${
                    isSpinning
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-600"
                  } text-white font-medium`}
                  onClick={spinWheel}
                  disabled={isSpinning}
                >
                  {isSpinning
                    ? "กำลังสุ่ม..."
                    : group
                    ? "สุ่มใหม่"
                    : "สุ่มกลุ่ม"}
                </button>
              </div>

              <div className="flex justify-between">
                <button
                  className="text-blue-600"
                  onClick={() => setCurrentStep("personalInfo")}
                >
                  ย้อนกลับ
                </button>
                <button
                  className={`px-6 py-2 rounded-md ${
                    group
                      ? "bg-blue-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!group}
                  onClick={handleConfirmRegistration}
                >
                  ยืนยันการลงทะเบียน
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}