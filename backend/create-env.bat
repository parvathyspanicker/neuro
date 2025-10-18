@echo off
echo Creating .env file...
echo.

echo MONGODB_URI=mongodb://localhost:27017/neurocare > .env
echo JWT_SECRET=your-super-secret-jwt-key-change-in-production >> .env
echo PORT=3002 >> .env
echo NODE_ENV=development >> .env
echo FRONTEND_URL=http://localhost:5173 >> .env

echo.
echo .env file created successfully!
echo.
echo Then restart the server with: npm run dev
pause