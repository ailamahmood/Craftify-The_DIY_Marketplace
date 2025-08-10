import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image } from 'react-native';
import axios from 'axios';
import moment from 'moment';
import { CHARITY_API } from '../../config/apiConfig';

const CharityScreen = () => {
  const [currentMonthData, setCurrentMonthData] = useState([]);
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = moment();
  const currentMonth = now.month() + 1;
  const currentYear = now.year();
  const lastMonth = moment().subtract(1, 'months');
  const lastMonthNumber = lastMonth.month() + 1;
  const lastMonthYear = lastMonth.year();

  useEffect(() => {
    const fetchCharityData = async () => {
      try {
        const [currentRes, lastRes, orgRes] = await Promise.all([
          axios.get(`${CHARITY_API}/month/${currentYear}/${currentMonth}`),
          axios.get(`${CHARITY_API}/month/${lastMonthYear}/${lastMonthNumber}`),
          axios.get(`${CHARITY_API}/charity-organizations`)
        ]);

        setCurrentMonthData(currentRes.data);

        const lastMonthSum = lastRes.data.reduce((sum, c) => sum + parseFloat(c.amount), 0);
        setLastMonthTotal(lastMonthSum);

        setOrganizations(orgRes.data);
      } catch (err) {
        console.error('Error loading charity data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCharityData();
  }, []);

  const totalCurrentMonth = currentMonthData.reduce((sum, c) => sum + parseFloat(c.amount), 0);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#8B4513"/>
      </View>
    );
  }

  const SummarySection = () => (
    <View className="bg-white p-5">
      <Text className="text-lightblack mt-4 text-[28px] font-i28_semibold text-center mb-6">Charity Overview</Text>

      <Text className="text-xl font-i28_semibold text-lightblack mb-6"> Charity Amount</Text>

      {/* This Month */}
      <View className="bg-gray-100 rounded-xl p-4 mb-6">
        <Text className="text-lg font-i28_semibold text-brown mb-1">This Month</Text>
        <Text className="font-i28_regular">Total Charity: PKR {totalCurrentMonth.toFixed(2)}</Text>
        <Text className="font-i28_regular">Orders with Charity: {currentMonthData.length}</Text>
      </View>

      {/* Last Month */}
      <View className="bg-gray-100 rounded-xl p-4 mb-4">
        <Text className="text-lg font-i28_semibold text-brown mb-1">Last Month</Text>
        <Text className="font-i28_regular">Total Charity: PKR {lastMonthTotal.toFixed(2)}</Text>
      </View>
    </View>
  );

  const OrganizationsSection = () => (
    <View className="px-5">
      <Text className="text-xl font-i28_semibold text-lightblack mb-6"> Charity Organizations</Text>

      {organizations.map((org) => (
        <View key={org.charity_org_id} className="bg-gray-100 mb-4 p-4 rounded-xl">
          <Text className="text-lg font-i28_semibold text-brown">{org.name}</Text>
          <Text className="font-i28_regular text-gray-700 mb-1">{org.description}</Text>
          <Text className="font-i28_regular">Contact: {org.contact}</Text>
          <Text className="font-i28_regular">Charity Received: PKR {parseFloat(org.charity_received).toFixed(2)}</Text>
          <Text className="font-i28_semibold mt-2">Acknowledgement:</Text>
          {org.acknowledgement_url ? (
            <Image
              source={{ uri: org.acknowledgement_url }}
              style={{ height: 150, marginTop: 10, borderRadius: 10 }}
              resizeMode="cover"
            />
          ) : (
            <Text className="text-gray-500 italic mt-2">No acknowledgement image</Text>
          )}
        </View>
      ))}
    </View>
  );

  const DonationsHeader = () => (
    <View className="px-5 mt-4 mb-2">
      <Text className="text-xl font-i28_semibold text-lightblack mb-2">This Month's Donation Details</Text>
    </View>
  );

  return (
    <FlatList
      className="flex-1 bg-white"
      data={currentMonthData}
      keyExtractor={(item) => item.order_id}
      ListHeaderComponent={
        <>
          <SummarySection />
          <OrganizationsSection />
          <DonationsHeader />
        </>
      }
      contentContainerStyle={{ paddingBottom: 50 }}
      ListEmptyComponent={<Text className="px-5">No donations this month.</Text>}
      renderItem={({ item }) => (
        <View className="px-5 border-b border-gray-300 py-2">
          <Text className="font-i28_regular">Order ID: {item.order_id}</Text>
          <Text className="font-i28_regular">Amount: PKR {parseFloat(item.amount).toFixed(2)}</Text>
          <Text className="font-i28_regular">Store: {item.store_name}</Text>
          <Text className="font-i28_regular">Date: {moment(item.order_date).format('MMM D, YYYY')}</Text>
        </View>
      )}
    />
  );
};

export default CharityScreen;
