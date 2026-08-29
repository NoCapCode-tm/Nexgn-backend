import mongoose from "mongoose";


const teamSchema = mongoose.Schema({
        org_id:{
            type:String,
            required:true,
        },
        company_name:{
            type:String,
        },
        team_size:{
            type:String,
        },
        industry:{
            type:String,
        },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
//     member:[{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"user",
//         default:[]
        
//     }],
//     subAdmin:[{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"user",
//         default:[]
        
// }],
//     templates:[{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"template",
//         default:[]
//     }],
//     documents:[{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"doc",
//         default:[]
//     }]
},{timestamps:true})

export const team = new mongoose.model("team",teamSchema)