import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import FAQItem from '../../components/ui/FAQItem';

const faqData = [
    // Leaderboard
    {
        question: "How does the leaderboard work?",
        answer:
            "Customers earn points by placing orders and writing reviews. The leaderboard ranks users based on these points. At the end of each month, the top users receive special Craftify gift boxes as rewards.",
    },
    {
        question: "Do my points reset?",
        answer:
            "Yes, all points reset to zero at the beginning of each month so everyone has a fair chance to compete.",
    },
    {
        question: "How can I increase my points?",
        answer:
            "You earn points by purchasing craft kits and writing reviews for products you have ordered. The more active you are, the more points you accumulate.",
    },

    // Chat
    {
        question: "How do I start a chat with a seller?",
        answer:
            "When you visit a store page, tap the 'Chat with Seller' button to open a chat window. You can also view all your chats anytime from your account screen.",
    },
    {
        question: "Can I send pictures in chat?",
        answer:
            "Yes! You can send images in your chats by tapping the image icon inside the chat window.",
    },
    {
        question: "Who can I chat with on Craftify?",
        answer:
            "Customers can chat directly with sellers to ask questions or discuss customizations. Sellers can reply and manage all their chats from their account screen.",
    },

    // Customization
    {
        question: "How do I customize a craft kit?",
        answer:
            "If a product has customization options, you can select these on the product detail page before adding it to your cart. Options might include colors, sizes, or add-ons.",
    },
    {
        question: "Can I request customizations not listed?",
        answer:
            "Yes, you can send a message to the seller via chat and ask if other customizations are possible.",
    },

    // Memory Book
    {
        question: "What is the Memory Book feature?",
        answer:
            "The Memory Book lets you save photos and notes about your crafting projects after you complete an order, helping you keep a creative journal of your experiences.",
    },
    {
        question: "Do I have to add photos to the Memory Book?",
        answer:
            "No, adding photos is optional. You can simply add notes if you prefer.",
    },

    // NGOs & Charity
    {
        question: "How does Craftify support charities?",
        answer:
            "Some sellers donate a percentage of their sales to registered NGOs. This percentage is shown on the product page as 'Charity Contribution'.",
    },
    {
        question: "Can I choose which NGO to support?",
        answer:
            "Currently, the seller decides which NGO they support. You can view the NGO information on the seller's store page.",
    },

    // General
    {
        question: "Can I update or delete my review?",
        answer:
            "Yes, you can edit or delete your review anytime from the order history screen where you submitted the review.",
    },
    {
        question: "How do I track my orders?",
        answer:
            "Go to the 'Orders' section in your account. Tap on any order to see the detailed status and shipment tracking info.",
    },
    {
        question: "What if I face an issue with my order?",
        answer:
            "First, contact the seller through chat to resolve the issue. If the problem persists, reach out to Craftify support from the Help section in your profile.",
    },
];

const FAQ = () => {
    return (

        <View className="flex-1 bg-white px-5">
            {/* Header outside ScrollView */}
            <Text className="text-lightblack mt-10 text-[28px] font-i28_semibold text-center">
                Frequently Asked Questions
            </Text>

            {/* ScrollView for FAQ items only */}
            <ScrollView className="mt-3" showsVerticalScrollIndicator={false}>
                {faqData.map((item, index) => (
                    <FAQItem key={index} question={item.question} answer={item.answer} />
                ))}
            </ScrollView>
        </View>
    );
};

export default FAQ;
