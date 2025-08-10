import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LineChart } from "react-native-chart-kit";
import { SELLERDASHBOARD_API } from '../../config/apiConfig';
import CustomButton from "../../components/ui/CustomButton";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { generateSellerReport } from "../../utils/generateSellerReport";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const [storeRating, setStoreRating] = useState(0);
  const [salesSummary, setSalesSummary] = useState(null);
  const [ordersSummary, setOrdersSummary] = useState([]);
  const [completedThisMonth, setCompletedThisMonth] = useState(0);
  const [topProduct, setTopProduct] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [salesChartData, setSalesChartData] = useState([]);

  const fetchDashboardData = async (sellerId) => {
    try {
      // 1. Store Info
      const storeRes = await axios.get(`${SELLERDASHBOARD_API}/store-info/${sellerId}`);
      setStoreInfo(storeRes.data);
      setStoreId(storeRes.data.store_id);

      // 2. Store Rating
      const ratingRes = await axios.get(`${SELLERDASHBOARD_API}/store-rating/${storeRes.data.store_id}`);
      setStoreRating(ratingRes.data.average_rating || 0);

      // 3. Sales Summary
      const salesSumRes = await axios.get(`${SELLERDASHBOARD_API}/sales-summary/${storeRes.data.store_id}`);
      setSalesSummary(salesSumRes.data);

      // 4. Orders Summary
      const ordersSumRes = await axios.get(`${SELLERDASHBOARD_API}/orders-summary/${storeRes.data.store_id}`);
      setOrdersSummary(ordersSumRes.data);

      // 5. Completed Orders This Month
      const completedRes = await axios.get(`${SELLERDASHBOARD_API}/completed-orders-month/${storeRes.data.store_id}`);
      setCompletedThisMonth(completedRes.data.completed_orders_count);

      // 6. Top Product
      try {
        const topProdRes = await axios.get(`${SELLERDASHBOARD_API}/top-product/${storeRes.data.store_id}`);
        setTopProduct(topProdRes.data);
      } catch {
        setTopProduct(null);
      }

      // 7. Low Stock
      const lowStockRes = await axios.get(`${SELLERDASHBOARD_API}/low-stock/${storeRes.data.store_id}`);
      setLowStock(lowStockRes.data);

      // 8. Sales Chart Data
      const salesChartRes = await axios.get(`${SELLERDASHBOARD_API}/sales-chart/${storeRes.data.store_id}`);
      setSalesChartData(salesChartRes.data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      Alert.alert("Error", "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const { id: sellerId } = JSON.parse(userData);
        fetchDashboardData(sellerId);
      }
    };
    getUser();
  }, []);
  
 if (loading) {
     return (
       <View className="flex-1 justify-center items-center bg-white">
         <ActivityIndicator size="large" color="#8B4513" />
       </View>
     );
   }


  // Safe number parsing helpers:
  const safeNumberFormat = (value, decimals = 2) => {
    const num = Number(value);
    return !isNaN(num) ? num.toFixed(decimals) : (decimals === 0 ? "0" : "0.00");
  };

  // Prepare sales chart
  const chartLabels = salesChartData.map((d) => d.year_month);
  const salesData = salesChartData.map((d) => d.sales_count);
  const revenueData = salesChartData.map((d) => {
    if (d.revenue === null || d.revenue === undefined) return 0;
    const num = Number(d.revenue);
    return isNaN(num) ? 0 : Number(num.toFixed(2));
  });

  const formattedStoreRating = safeNumberFormat(storeRating);
  const formattedTotalRevenueLifetime = safeNumberFormat(salesSummary?.total_revenue_lifetime);
  const formattedTotalRevenueMonth = safeNumberFormat(salesSummary?.total_revenue_month);

  return (
     <SafeAreaView className="flex-1 p-5 bg-white">
                <View className="mb-2">
                    <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">Dashboard</Text>
                </View>
                
    <ScrollView
    showsVerticalScrollIndicator={false} 
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {/* Store Info */}
      <View className="mb-6 mt-4">
        
        {storeInfo?.store_logo && (
          <Image
            source={{ uri: storeInfo?.store_logo || 'https://placehold.co/400x300' }}
            className="w-full h-[150px] rounded-lg mb-6"
          />
        )}
        <Text className="text-2xl font-i28_semibold text-center text-brown">{storeInfo?.store_name}</Text>
        <Text className="text-base text-lightblack font-i28_regular mt-2">
          {storeInfo?.store_description || "No description."}
        </Text>
      </View>
  
      {/* Store Rating */}
      <View className="mb-6">
        <Text className="text-xl text-lightblack font-i28_semibold mb-2">Store Rating</Text>
        <Text className="text-2xl text-brown font-i28_semibold">{formattedStoreRating} / 5</Text>
      </View>
  
      {/* Sales Summary */}
      <View className="mb-6">
        <Text className="text-xl text-lightblack font-i28_semibold mb-2">Sales Summary</Text>
        <Text className="text-base text-lightblack font-i28_regular">Sales This Month: {salesSummary?.total_sales_month || 0}</Text>
        <Text className="text-base text-lightblack font-i28_regular mb-4">Revenue This Month: PKR {formattedTotalRevenueMonth}</Text>
        <Text className="text-base text-lightblack font-i28_regular">Total Sales (Lifetime): {salesSummary?.total_sales_lifetime || 0}</Text>
        <Text className="text-base text-lightblack font-i28_regular">Total Revenue (Lifetime): PKR {formattedTotalRevenueLifetime}</Text>
      </View>
  
      {/* Orders Summary */}
      <View className="mb-6">
        <Text className="text-xl text-lightblack font-i28_semibold mb-2">Orders Summary</Text>
        {ordersSummary.length === 0 && <Text>No orders found.</Text>}
        {ordersSummary.map(({ status, count }) => (
          <Text className="text-base text-lightblack font-i28_regular" key={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
          </Text>
        ))}
      </View>
  
      {/* Completed Orders This Month */}
      <View className="mb-6">
        <Text className="text-xl text-lightblack font-i28_semibold mb-2">
          Completed Orders This Month
        </Text>
        <Text className="text-base text-lightblack font-i28_regular">{completedThisMonth}</Text>
      </View>
  
      {/* Top Selling Product */}
      <View className="mb-6">
        <Text className="text-xl text-lightblack font-i28_semibold b-2">Top Selling Product</Text>
        {topProduct ? (
          <>
            <Text className="text-lg font-i28_semibold text-brown mt-2">{topProduct.product_name}</Text>
            <Text className="text-base text-lightblack font-i28_regular">Total Sold: {topProduct.total_quantity_sold}</Text>
          </>
        ) : (
          <Text>No sales data available.</Text>
        )}
      </View>
  
      {/* Low Stock Products */}
      <View className="mb-6">
        <Text className="text-xl text-lightblack font-i28_semibold mb-2">
          Low Stock Products (Less than 10)
        </Text>
        {lowStock.length === 0 && <Text className="text-base text-lightblack font-i28_regular">All products have sufficient stock.</Text>}
        <FlatList
          data={lowStock}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => (
            <View className="flex-row py-[6px] border-b border-[#eee]">
              <Text className="flex-1 text-base text-lightblack font-i28_regular">{item.product_name}</Text>
              <Text
                style={{
                  color: item.stock_quantity < 5 ? "red" : "orange",
                }}
              >
                {item.stock_quantity}
              </Text>
            </View>
          )}
          scrollEnabled={false}
        />
      </View>
  
      {/* Sales Chart */}
      <View className="mb-6">
        <Text className="text-xl text-lightblack font-i28_semibold mb-2">
          Sales & Revenue (Last 6 Months)
        </Text >
        {salesChartData.length === 0 ? (
          <Text className="text-base text-lightblack font-i28_regular">No sales data to display.</Text>
        ) : (
          <LineChart
            data={{
              labels: chartLabels,
              datasets: [
                { data: salesData, color: () => "#282932", label: "Sales Count" },
                { data: revenueData, color: () => "#704F38", label: "Revenue (PKR)" },
              ],
              legend: ["Sales Count", "Revenue (PKR)"],
            }}
            width={Dimensions.get("window").width - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#f9fafb",
              backgroundGradientTo: "#f9fafb",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(156, 66, 33, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#9c4221",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        )}
      </View>
  
      <View className="mt-6" />
      <CustomButton
  title="Download PDF Report"
  onPress={() =>
    generateSellerReport({
      storeInfo,
      storeRating,
      salesSummary,
      ordersSummary,
      completedThisMonth,
      topProduct,
      lowStock,
      salesChartData
    })
  }
/>
    </ScrollView>
    </SafeAreaView>
   );
  };

export default Dashboard;
