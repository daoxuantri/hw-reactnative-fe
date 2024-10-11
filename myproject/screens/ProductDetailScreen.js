// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   FlatList,
//   ActivityIndicator,
//   TextInput,
//   Button,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function ProductDetailScreen({ route }) {
//   const { product } = route.params;
//   const [reviews, setReviews] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [canComment, setCanComment] = useState(false);
//   const [comment, setComment] = useState('');

//   // Fetch reviews from API
//   useEffect(() => {
//     const fetchReviews = async () => {
//       try {
//         const response = await fetch('http://192.168.2.183:4000/reviews/getallreview', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ productId: product._id }),
//         });

//         if (!response.ok) {
//           throw new Error('Đã xảy ra lỗi khi lấy đánh giá.');
//         }

//         const responseJson = await response.json();
//         setReviews(responseJson.data);
//       } catch (error) {
//         setError(error.message);
//         console.error('Error fetching reviews:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReviews();
//   }, [product._id]);

//   // Kiểm tra trạng thái đơn hàng
//   useEffect(() => {
//     const checkOrderStatus = async () => {
//       const storedUserData = await AsyncStorage.getItem('userData');
//       const userData = JSON.parse(storedUserData);
//       const userId = userData.id;
//       try {
//         const response = await fetch('http://192.168.2.183:4000/reviews/checkstatus', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             userId: userId, // Thay đổi userId cho phù hợp
//             productId: product._id,
//           }),
//         });
    
//         const text = await response.text(); // Get the raw response text
//         console.log('Raw response:', text); // Log the response
    
//         const responseJson = JSON.parse(text); // Parse the response as JSON
//         setCanComment(responseJson.canComment);
//       } catch (error) {
//         console.error('Error checking order status:', error);
//       }
//     };
    
//     checkOrderStatus();
//   }, [product._id]);

//   const handleCommentSubmit = async () => {
//     if (!comment) {
//       alert('Vui lòng nhập bình luận.');
//       return;
//     }

//     try {
//       const storedUserData = await AsyncStorage.getItem('userData');
//       const userData = JSON.parse(storedUserData);
//       const userId = userData.id;
//       const response = await fetch('http://192.168.2.183:4000/reviews/createreview', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           userId: userId, // Thay đổi userId cho phù hợp
//           productId: product._id,
//           content: comment,
//           rating: 5, // Thay đổi để cho phép người dùng chọn số sao
//         }),
//       });

//       const responseJson = await response.json();
//       if (responseJson.success) {
//         setReviews((prevReviews) => [
//           ...prevReviews,
//           { content: comment, rating: 5, user: { email: userData.email } }, // Thay đổi để lấy email thực tế
//         ]);
//         setComment('');
//       } else {
//         alert(responseJson.message);
//       }
//     } catch (error) {
//       console.error('Error submitting comment:', error);
//     }
//   };

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.errorText}>Lỗi: {error}</Text>
//       </View>
//     );
//   }

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Image source={{ uri: product.images }} style={styles.productImage} />
//       <Text style={styles.productName}>{product.name}</Text>
//       <Text style={styles.productPrice}>{product.price} VND</Text>
//       <Text style={styles.productDescription}>{product.description}</Text>

//       <View style={styles.ratingContainer}>
//         <Text style={styles.ratingTitle}>Đánh giá ({reviews.length})</Text>
//       </View>

//       {reviews.length === 0 ? (
//         <Text style={styles.noReviews}>Chưa có bình luận nào.</Text>
//       ) : (
//         <FlatList
//           data={reviews}
//           keyExtractor={(item) => item._id}
//           renderItem={({ item }) => (
//             <View style={styles.commentContainer}>
//               <View style={styles.commentHeader}>
//                 <Icon name="person" size={24} color="#000" />
//                 <Text style={styles.commentUser}>{item.user.email}</Text>
//                 <View style={styles.commentRating}>
//                   {[...Array(item.rating)].map((_, index) => (
//                     <Icon key={index} name="star" size={16} color="#FFD700" />
//                   ))}
//                 </View>
//               </View>
//               <Text style={styles.commentContent}>{item.content}</Text>
//             </View>
//           )}
//         />
//       )}

//       {canComment ? (
//         <View style={styles.commentForm}>
//           <TextInput
//             style={styles.commentInput}
//             placeholder="Viết bình luận của bạn..."
//             value={comment}
//             onChangeText={setComment}
//           />
//           <Button title="Gửi bình luận" onPress={handleCommentSubmit} />
//         </View>
//       ) : (
//         <Text style={styles.noCommentText}>
//           Bạn chỉ có thể bình luận khi đã mua và nhận hàng thành công.
//         </Text>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   productImage: {
//     width: '100%',
//     height: 300,
//     marginBottom: 20,
//   },
//   productName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   productPrice: {
//     fontSize: 20,
//     color: '#888',
//     marginBottom: 10,
//   },
//   productDescription: {
//     fontSize: 16,
//     marginBottom: 20,
//   },
//   ratingContainer: {
//     marginBottom: 20,
//   },
//   ratingTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   commentContainer: {
//     padding: 10,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   commentHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   commentUser: {
//     marginLeft: 10,
//     fontWeight: 'bold',
//   },
//   commentRating: {
//     flexDirection: 'row',
//     marginLeft: 'auto',
//   },
//   commentContent: {
//     fontSize: 16,
//     color: '#444',
//   },
//   noReviews: {
//     fontStyle: 'italic',
//     color: '#888',
//   },
//   commentForm: {
//     marginTop: 20,
//   },
//   commentInput: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 10,
//   },
//   noCommentText: {
//     color: '#ff0000',
//     fontStyle: 'italic',
//     marginTop: 20,
//   },
// });




import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  TextInput,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

export default function ProductDetailScreen({ route }) {
  const { product } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canComment, setCanComment] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const navigation = useNavigation();

  
  

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://192.168.2.183:4000/reviews/getallreview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: product._id }),
        });

        if (!response.ok) {
          throw new Error('Đã xảy ra lỗi khi lấy đánh giá.');
        }

        const responseJson = await response.json();
        setReviews(responseJson.data);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [product._id]);


  const fetchReviews = async () => {
    setLoading(true); // Bắt đầu loading
    try {
      const response = await fetch('http://192.168.2.183:4000/reviews/getallreview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product._id }),
      });
  
      if (!response.ok) {
        throw new Error('Đã xảy ra lỗi khi lấy đánh giá.');
      }
  
      const responseJson = await response.json();
      setReviews(responseJson.data);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  // Kiểm tra trạng thái đơn hàng
  useEffect(() => {
    const checkOrderStatus = async () => {
      const storedUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(storedUserData);
      const userId = userData.id;
      try {
        const response = await fetch('http://192.168.2.183:4000/reviews/checkstatus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            productId: product._id,
          }),
        });

        const text = await response.text();
        console.log('Raw response:', text);

        const responseJson = JSON.parse(text);
        setCanComment(responseJson.canComment);
      } catch (error) {
        console.error('Error checking order status:', error);
      }
    };

    checkOrderStatus();
  }, [product._id]);

  const handleCommentSubmit = async () => {
    if (!comment) {
      alert('Vui lòng nhập bình luận.');
      return;
    }
  
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(storedUserData);
      
      // Kiểm tra xem userData có tồn tại hay không
      if (!userData || !userData.id) {
        alert('Người dùng không hợp lệ.');
        return;
      }
  
      const response = await fetch('http://192.168.2.183:4000/reviews/createreview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          productId: product._id,
          content: comment,
          rating: rating,
        }),
      });
  
      const responseJson = await response.json();
      if (responseJson.success) {
        setReviews((prevReviews) => [
          ...prevReviews,
          { content: comment, rating: rating, user: { email: userData.email } },
        ]);
        setComment('');
        setRating(0);
      } else {
        alert(responseJson.message);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const renderProductInfo = () => (
    <View style={styles.productContainer}>
      <Text style={styles.sectionTitle}>Chi tiết sản phẩm</Text>
      <Image source={{ uri: product.images }} style={styles.productImage} />
      <View style={styles.productInfoContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.price} VND</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
      </View>
    </View>
  );

  const renderReviewsHeader = () => (
    <View style={styles.reviewsHeader}>
      <Text style={styles.sectionTitle}>
        Đánh giá ({reviews.length})
      </Text>
    </View>
  );

  const renderCommentInput = () => (
    canComment ? (
      <Button title="Viết bình luận" onPress={() => navigation.navigate('Comment', { product, onCommentSubmit: fetchReviews })} />
    ) : (
      <Text style={styles.noCommentText}>
        Bạn chỉ có thể bình luận khi đã mua và nhận hàng thành công.
      </Text>
    )
  );

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Lỗi: {error}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <FlatList
      
        ListHeaderComponent={
          <>
            {renderProductInfo()}
            {renderReviewsHeader()}
          </>
        }
        data={reviews}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.commentContainer}>
            <View style={styles.commentHeader}>
              <Icon name="person" size={24} color="#000" />
              <Text style={styles.commentUser}>{item.user.email}</Text>
              <View style={styles.commentRating}>
                {[...Array(item.rating)].map((_, index) => (
                  <Icon key={index} name="star" size={16} color="#FFD700" />
                ))}
              </View>
            </View>
            <Text style={styles.commentContent}>{item.content}</Text>
          </View>
        )}
        ListFooterComponent={renderCommentInput}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  productContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingHorizontal: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 15,
  },
  productInfoContainer: {
    padding: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 20,
    color: '#888',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  reviewsHeader: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentUser: {
    marginLeft: 10,
    fontWeight: 'bold',
  },
  commentRating: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  commentContent: {
    fontSize: 16,
    color: '#444',
  },
  commentForm: {
    marginTop: 20,
    marginHorizontal: 10,
    paddingBottom: 20, // Thêm khoảng cách dưới
},
  commentInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  noCommentText: {
    color: '#ff0000',
    fontStyle: 'italic',
    marginTop: 20,
    marginHorizontal: 10,
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
  },
});

