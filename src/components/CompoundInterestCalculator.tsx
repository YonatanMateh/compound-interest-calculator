"use client";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  Button,
  Input,
  Select,
  Stats,
  Table,
  Alert,
} from "react-daisyui";

interface CalculatorInputs {
  initialAmount: string;
  interestRate: string;
  depositFrequency: "monthly" | "yearly";
  durationType: "months" | "years";
  duration: string;
  periodicDeposit: string;
}

interface CalculationResult {
  finalAmount: number;
  totalDeposits: number;
  totalProfit: number;
  profitAfterTax: number;
  monthlyDetails: {
    period: number;
    deposit: number;
    profit: number;
    total: number;
  }[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatPeriod = (period: number) => {
  const years = Math.floor(period / 12);
  const months = period % 12;

  if (years === 0) return `${months} חודשים`;
  if (months === 0) return `${years} שנים`;
  return `${years} שנים ו-${months} חודשים`;
};

export default function CompoundInterestCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    const savedInputs = localStorage.getItem("calculatorInputs");
    return savedInputs
      ? JSON.parse(savedInputs)
      : {
          initialAmount: "",
          interestRate: "",
          depositFrequency: "monthly",
          durationType: "years",
          duration: "",
          periodicDeposit: "",
        };
  });

  const [calculatedInputs, setCalculatedInputs] =
    useState<CalculatorInputs | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    if (inputs.depositFrequency === "yearly") {
      setInputs((prev) => ({ ...prev, durationType: "years" }));
    }
  }, [inputs.depositFrequency]);

  useEffect(() => {
    localStorage.setItem("calculatorInputs", JSON.stringify(inputs));
  }, [inputs]);

  const calculateCompoundInterest = () => {
    setCalculatedInputs(inputs);

    const totalMonths =
      inputs.durationType === "years"
        ? Number(inputs.duration) * 12
        : Number(inputs.duration);
    const monthlyRate = Number(inputs.interestRate) / 100 / 12;
    const monthlyDeposit =
      inputs.depositFrequency === "monthly"
        ? Number(inputs.periodicDeposit)
        : Number(inputs.periodicDeposit) / 12;

    let currentAmount = Number(inputs.initialAmount);
    let totalDeposits = Number(inputs.initialAmount);
    const monthlyDetails = [];

    for (let month = 1; month <= totalMonths; month++) {
      const monthlyInterest = currentAmount * monthlyRate;
      const deposit =
        inputs.depositFrequency === "monthly"
          ? monthlyDeposit
          : month % 12 === 0
          ? Number(inputs.periodicDeposit)
          : 0;

      currentAmount += monthlyInterest + deposit;
      totalDeposits += deposit;

      monthlyDetails.push({
        period: month,
        deposit: totalDeposits,
        profit: currentAmount - totalDeposits,
        total: currentAmount,
      });
    }

    const totalProfit = currentAmount - totalDeposits;

    setResult({
      finalAmount: currentAmount,
      totalDeposits: totalDeposits,
      totalProfit: totalProfit,
      profitAfterTax: totalProfit * 0.75, // After 25% tax
      monthlyDetails,
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl flex justify-center">
      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-bold text-center mb-4">
          מחשבון ריבית דריבית
        </h1>

        <Alert className="mb-6 text-sm">
          <div>
            <h3 className="font-bold mb-2">הצהרה חשובה:</h3>
            <p>
              המחשבון מספק הערכה בלבד ואינו מהווה ייעוץ פיננסי או המלצה להשקעה.
              התוצאות מבוססות על הנחות פשטניות ועשויות להיות שונות מהמציאות.
              מומלץ להתייעץ עם יועץ פיננסי מוסמך לפני קבלת החלטות השקעה.
            </p>
          </div>
        </Alert>

        <div
          className={`flex flex-col lg:flex-row items-center gap-4 w-full ${
            !result || !calculatedInputs ? "justify-center" : ""
          }`}
        >
          <Card className={`bg-base-200 w-[300px] `}>
            <Card.Body className="p-4 ">
              <div className="flex flex-wrap gap-3">
                <div className="w-fit">
                  <label className="label">סכום התחלתי</label>
                  <Input
                    type="number"
                    className="w-full max-w-[100px] decima"
                    value={inputs.initialAmount}
                    onChange={(e) =>
                      setInputs({ ...inputs, initialAmount: e.target.value })
                    }
                    placeholder="0"
                    inputMode="decimal"
                  />
                </div>

                <div className="w-fit">
                  <label className="label">ריבית שנתית (%)</label>
                  <Input
                    type="number"
                    className="w-full max-w-[100px]"
                    value={inputs.interestRate}
                    onChange={(e) =>
                      setInputs({ ...inputs, interestRate: e.target.value })
                    }
                    placeholder="0"
                    inputMode="decimal"
                  />
                </div>

                <div className="w-fit">
                  <label className="label">סכום הפקדה</label>
                  <Input
                    type="number"
                    className="w-full max-w-[100px]"
                    value={inputs.periodicDeposit}
                    onChange={(e) =>
                      setInputs({ ...inputs, periodicDeposit: e.target.value })
                    }
                    placeholder="0"
                    inputMode="decimal"
                  />
                </div>

                <div className="w-fit">
                  <label className="label">תדירות הפקדה</label>
                  <div className="btn-group">
                    <Button
                      size="sm"
                      color={
                        inputs.depositFrequency === "monthly"
                          ? "primary"
                          : "ghost"
                      }
                      onClick={() =>
                        setInputs({ ...inputs, depositFrequency: "monthly" })
                      }
                      className="w-[100px]"
                    >
                      חודשי
                    </Button>
                    <Button
                      size="sm"
                      color={
                        inputs.depositFrequency === "yearly"
                          ? "primary"
                          : "ghost"
                      }
                      onClick={() =>
                        setInputs({ ...inputs, depositFrequency: "yearly" })
                      }
                      className="w-[100px]"
                    >
                      שנתי
                    </Button>
                  </div>
                </div>

                <div className="w-fit">
                  <label className="label">תקופה</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      className="flex-1 max-w-[100px]"
                      value={inputs.duration}
                      onChange={(e) =>
                        setInputs({ ...inputs, duration: e.target.value })
                      }
                      placeholder="0"
                      inputMode="decimal"
                    />
                    <Select
                      value={inputs.durationType}
                      onChange={(e) =>
                        setInputs({
                          ...inputs,
                          durationType: e.target.value as "months" | "years",
                        })
                      }
                      disabled={inputs.depositFrequency === "yearly"}
                    >
                      <Select.Option value="months">חודשים</Select.Option>
                      <Select.Option value="years">שנים</Select.Option>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                disabled={
                  inputs.periodicDeposit === "" || inputs.duration === ""
                }
                color="primary"
                className="mt-4"
                onClick={calculateCompoundInterest}
              >
                חשב
              </Button>
            </Card.Body>
          </Card>

          {result && calculatedInputs && (
            <div className="space-y-4 flex-1 w-full">
              <Stats className=" text-md flex flex-wrap gap-4 p-1">
                <Stats.Stat className="w-auto shadow">
                  <Stats.Stat.Title className="font-semibold">
                    סכום סופי
                  </Stats.Stat.Title>
                  <Stats.Stat.Value
                    className="text-lg"
                    style={{ color: "#8884d8" }}
                  >
                    {formatCurrency(result.finalAmount)}
                  </Stats.Stat.Value>
                </Stats.Stat>
                <Stats.Stat className="w-auto shadow">
                  <Stats.Stat.Title className="font-semibold">
                    סך הפקדות
                  </Stats.Stat.Title>
                  <Stats.Stat.Value
                    className="text-lg"
                    style={{ color: "#82ca9d" }}
                  >
                    {formatCurrency(result.totalDeposits)}
                  </Stats.Stat.Value>
                </Stats.Stat>
                <Stats.Stat className="w-auto shadow">
                  <Stats.Stat.Title className="font-semibold">
                    רווח
                  </Stats.Stat.Title>
                  <Stats.Stat.Value
                    className="text-lg"
                    style={{ color: "#ffc658" }}
                  >
                    {formatCurrency(result.totalProfit)}
                  </Stats.Stat.Value>
                </Stats.Stat>
                <Stats.Stat className="w-auto shadow">
                  <Stats.Stat.Title className="font-semibold">
                    רווח אחרי מס (25%)
                  </Stats.Stat.Title>
                  <Stats.Stat.Value
                    className="text-lg"
                    style={{ color: "#ffc658" }}
                  >
                    {formatCurrency(result.profitAfterTax)}
                  </Stats.Stat.Value>
                </Stats.Stat>
                <Stats.Stat className="w-auto shadow">
                  <Stats.Stat.Title className="font-semibold">
                    סכום סופי אחרי מס
                  </Stats.Stat.Title>
                  <Stats.Stat.Value
                    className="text-lg"
                    style={{ color: "#8884d8" }}
                  >
                    {formatCurrency(
                      result.totalDeposits + result.profitAfterTax
                    )}
                  </Stats.Stat.Value>
                </Stats.Stat>
              </Stats>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="overflow-auto flex-1 md:max-h-[400px] max-h-fit">
                  <Table size="sm">
                    <Table.Head>
                      <div className="flex gap-1 md:flex-row flex-col">
                        <span>תקופה</span>
                        <span>
                          {" "}
                          {calculatedInputs.depositFrequency === "monthly"
                            ? "(חודשים)"
                            : "(שנים)"}
                        </span>
                      </div>
                      {/* <span>
                        תקופה{" "}
                       
                      </span> */}
                      <span>הפקדות</span>
                      <span>רווח</span>
                      <span>סה&quot;כ</span>
                    </Table.Head>
                    <Table.Body className="text-sm">
                      {result.monthlyDetails
                        .filter(
                          (detail) =>
                            calculatedInputs.depositFrequency === "monthly" ||
                            detail.period % 12 === 0
                        )
                        .map((detail) => (
                          <Table.Row key={detail.period}>
                            <span>
                              {calculatedInputs.depositFrequency === "monthly"
                                ? detail.period
                                : detail.period / 12}
                            </span>
                            <span>{formatCurrency(detail.deposit)}</span>
                            <span>{formatCurrency(detail.profit)}</span>
                            <span>{formatCurrency(detail.total)}</span>
                          </Table.Row>
                        ))}
                    </Table.Body>
                  </Table>
                </div>

                <Card className="bg-base-200 hidden lg:flex">
                  <Card.Body className="p-2">
                    <LineChart
                      width={500}
                      height={300}
                      data={result.monthlyDetails}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        tickFormatter={(value) =>
                          calculatedInputs?.durationType === "months"
                            ? value
                            : Math.floor(value / 12)
                        }
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label) => formatPeriod(Number(label))}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#8884d8"
                        name="סה״כ"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="deposit"
                        stroke="#82ca9d"
                        name="הפקדות"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#ffc658"
                        name="רווח"
                        dot={false}
                      />
                    </LineChart>
                  </Card.Body>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
