class ApiResponse{

    static success(res,message,data={},status=200){

        return res.status(status).json({

            success:true,

            message,

            data

        });

    }

    static error(res,message,status=500){

        return res.status(status).json({

            success:false,

            message

        });

    }

}

module.exports=ApiResponse;