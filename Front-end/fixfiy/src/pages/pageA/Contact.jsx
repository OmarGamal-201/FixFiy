import React from "react";
import "./Contact.css";
import { useState } from 'react';
import {Home,User,FileText,CreditCard,Settings,LogOut,Bell,Search,ShieldCheck,UserCircle} from "lucide-react";
 
const Contact=()=> {
    return (
        <div className="contact-page">
           
            <main className="content">
                
                <h2>Contact</h2>
                <div className="contact-card">
                    
                  
                    <form>
                        <label>Name</label>
                        <input type="text" placeholder="Full Name"/>
                        <label>Email</label>
                        <input type="email" placeholder="@gmail.com"/>
                        <label>Phone Number</label>
                        <input type="text" placeholder="+20"/>
                        <label>Address</label>
                        <input type="text" placeholder="region,city"/>
                        <label>Message</label>
                        <textarea placeholder="more detail..."></textarea>
                        <button type="submit">Continue</button>
                    </form>
                </div>
            </main>

        </div>
    );
        
    
};


export default Contact;