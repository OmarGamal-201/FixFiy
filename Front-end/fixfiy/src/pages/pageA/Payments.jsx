import React from "react";
import "./Payments.css"
import { useState } from 'react';
import {Home,User,Users,FileText,CreditCard,Settings,LogOut,Bell,Search,ShieldCheck,UserCircle} from "lucide-react";
 
const Payments=()=> {
    return (
        <div className="payments-page">
              
              <main className="content">
               
                <h2>Payments</h2>
                
                <div className="payments-card">
                    
                  
                    <form>
                        <label>Method Name</label>
                        <input type="text" placeholder="visa...."/>
                        <label>Account / Wallet</label>
                        <input type="text" placeholder="enter number"/>


                        <div className="status-row">
                            <div>
                                <label>Method Status</label>
                                <span>Enable or Disable this method</span>
                            </div>
                                 <label className="switch">
                                    <input type="checkbox" defaultChecked/>
                                    <span className="slider"></span>
                                 </label>
                        </div>
                        <button type="submit">Save Payments Method</button>
                    </form>  
               </div>
            </main>
        </div>
    );
        
    
};


export default Payments;