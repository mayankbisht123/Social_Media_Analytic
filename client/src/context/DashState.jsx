import {useState} from "react";
import dashContext from "./dashContext";

const DashState=(props)=>{
    const[analytics,setAnalytics]=useState([]);
    const url="http://localhost:4000";

    const Login=async(loginInfo)=>{
        try{
            const response=await fetch(url+'/api/auth/login',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({email:loginInfo.email,password:loginInfo.password})
            });

            const data=await response.json().catch(()=>null);

            if(!response.ok){
                const message=data?.message || data?.error || 'Login failed';
                console.error('Login failed:',message);
                return {success:false,message};
            }

            if(data?.token){
                localStorage.setItem('token',data.token);
            }

            return {success:true,token:data?.token};
        }catch(error){
            console.error('Login request error:',error);
            throw error;
        }
    }

    const Signup=async(signupInfo)=>{
        try{
            const response=await fetch(url+'/api/auth/signup',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({name:signupInfo.name, email:signupInfo.email, password:signupInfo.password, cpassword:signupInfo.cpassword})
            });

            const data=await response.json().catch(()=>null);

            if(!response.ok){
                const message=data?.message || data?.error || 'Signup failed';
                console.error('Signup failed:',message);
                return {success:false,message};
            }

            return {success:data?.success ?? true,message:data?.message || 'Signup successful'};
        }catch(error){
            console.error('Signup request error:',error);
            throw error;
        }
        
    }

    const reddit=async()=>{
        if(!localStorage.getItem('token'))
        {
            console.error("Token is corrupted login again");
            return;
        }
        const token=localStorage.getItem('token');
        // console.log(token);

        try {

            window.location.href = `http://localhost:4000/api/auth/reddit?token=${token}`;
            
        } catch (error) {
            console.error(error);
            return;
        }
        
    }

    const getReddit=async()=>{
        const jwtToken=localStorage.getItem('token');
        try{
        const response=await fetch(url+'/api/redditData/reddit/get',{
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if(!response.ok)
        {
            const error=await response.json();
            console.error("response was not ok"+error);
            return;
        }

        const data=await response.json();
        // console.log(data);
        return data;
    }
    catch(e){
        console.error("Server error!"+e);
    }

    };

    // const resolveMonthData = (monthIndex) => {
    //     if (!analytics || !Array.isArray(analytics.analytics)) {
    //         return null;
    //     }

    //     const now = new Date();
    //     const currentYear = now.getFullYear().toString();
    //     const monthNames = [
    //         "January", "February", "March", "April", "May", "June",
    //         "July", "August", "September", "October", "November", "December"
    //     ];
    //     const currentMonthName = monthNames[monthIndex];
    //     const yearObj = analytics.analytics.find(y => y.year === currentYear);
    //     if (!yearObj || !Array.isArray(yearObj.months)) {
    //         return null;
    //     }
    //     return yearObj.months.find(m => m.month === currentMonthName) || null;
    // }


    // Calculates total upvotes for the current month and year from the analytics data structure
    // const totalUpvotes = (month) => {
    //     const monthObj = resolveMonthData(month);
    //     if (!monthObj) {
    //         return 0;
    //     }
    //     return monthObj.totalLikes ?? 0;
    // }

    // Calculates total comments for the current month and year
    // const totalComments = (month) => {
    //     const monthObj = resolveMonthData(month);
    //     if (!monthObj) {
    //         return 0;
    //     }
    //     return monthObj.totalComments ?? 0;
    // }

    // Calculates total replies from all comments across all posts
    // const totalReplies = (month) => {
    //     const monthObj = resolveMonthData(month);
    //     if (!monthObj) {
    //         return 0;
    //     }
    //     return monthObj.totalReplies ?? 0;
    // }

    // Calculates immersion score using the formula: (totalComments * 0.7) + (totalReplies * 0.3) + (upvotes * 0.2)
    const immersionScore = (month) => {
        // Early return if analytics is not available or doesn't have the expected structure
        if (!analytics || !analytics.analytics || !Array.isArray(analytics.analytics)) {
            // console.log('Analytics data not available or invalid structure');
            return 0;
        }

        // Get the required metrics
        const comments = month.totalComments;
        const replies = month.totalReplies;
        const upvotes = month.totalLikes;

        // console.log('Immersion calculation:', { comments, replies, upvotes });

        // Calculate immersion score with weighted formula
        const immersionScore = (comments * 0.7) + (replies * 0.3) + (upvotes * 0.2);
        // console.log('Immersion score calculated:', immersionScore.toFixed(2));
        
        return immersionScore.toFixed(1); // Return as string with 2 decimal places
    }

    // Calculates engagement rate using the formula: ((upvotes + total_comments) / followers) * 100
    const engagementRate = (month) => {
        // Early return if analytics is not available or doesn't have the expected structure
        if (!analytics || !analytics.analytics || !Array.isArray(analytics.analytics)) {
            // console.log('Analytics data not available or invalid structure');
            return 0;
        }

        // Get total upvotes and comments
        const upvotes = month.totalLikes;
        const comments = month.totalComments;
        const followers = analytics.karma || 0;
        console.log(upvotes)
        console.log(comments)
        // console.log('Engagement calculation:', { upvotes, comments, followers });

        // Calculate engagement rate
        if (followers === 0) {
            // console.log('No followers, engagement rate is 0');
            return 0;
        }

        const engagementRate = ((upvotes + comments) / followers) * 100;
        
        
        return engagementRate.toFixed(1); 
    }

    const ActivityFeed=async()=>{
        const jwtToken=localStorage.getItem('token');
        const response=await fetch(url+'/api/redditData/reddit/activity',{
            method:'GET',
            headers:
            {
                'Content-Type':'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if(!response.ok)
        {
            const error=response.json()
            console.error(error);
        }

        const data=await response.json();
        return data;
    }

    return(
        <dashContext.Provider value={{Login,Signup,reddit,getReddit,analytics,setAnalytics,engagementRate,immersionScore,ActivityFeed}}>
            {props.children}
        </dashContext.Provider>
    );
}


export default DashState;