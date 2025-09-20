-- CreateTable
CREATE TABLE "Dojos" (
    "id" SERIAL NOT NULL,
    "dojo" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Dojos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedules" (
    "id" SERIAL NOT NULL,
    "dojoId" INTEGER NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "martialArtId" INTEGER NOT NULL,

    CONSTRAINT "Schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MartialArts" (
    "id" SERIAL NOT NULL,
    "martialArt" TEXT NOT NULL,

    CONSTRAINT "MartialArts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "identification" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dojoId" INTEGER NOT NULL,
    "rolId" INTEGER NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "profileImg" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Representatives" (
    "id" SERIAL NOT NULL,
    "representativeId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "Representatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "rol" TEXT NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activities" (
    "id" SERIAL NOT NULL,
    "activityName" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "activityTime" TIMESTAMP(3) NOT NULL,
    "activityPlace" TEXT NOT NULL,
    "activityLocation" TEXT NOT NULL,
    "dojoId" INTEGER NOT NULL,

    CONSTRAINT "Activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityAttendance" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ActivityAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DojoAttendance" (
    "id" SERIAL NOT NULL,
    "dojoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "date_attendance" TIMESTAMP(3) NOT NULL,
    "time_attendance" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DojoAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exams" (
    "id" SERIAL NOT NULL,
    "martialArtId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "ranksId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,

    CONSTRAINT "Exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppliedStudents" (
    "id" SERIAL NOT NULL,
    "martialArtId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "ranksId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,

    CONSTRAINT "AppliedStudents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ranks" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "rank_name" TEXT NOT NULL,
    "belt" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "martialArtId" INTEGER NOT NULL,

    CONSTRAINT "Ranks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethods" (
    "id" SERIAL NOT NULL,
    "payment_method" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "identification" TEXT NOT NULL,
    "dojoId" INTEGER NOT NULL,

    CONSTRAINT "PaymentMethods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "paymentMethodId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Schedules" ADD CONSTRAINT "Schedules_dojoId_fkey" FOREIGN KEY ("dojoId") REFERENCES "Dojos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedules" ADD CONSTRAINT "Schedules_martialArtId_fkey" FOREIGN KEY ("martialArtId") REFERENCES "MartialArts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_dojoId_fkey" FOREIGN KEY ("dojoId") REFERENCES "Dojos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Representatives" ADD CONSTRAINT "Representatives_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Representatives" ADD CONSTRAINT "Representatives_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_dojoId_fkey" FOREIGN KEY ("dojoId") REFERENCES "Dojos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttendance" ADD CONSTRAINT "ActivityAttendance_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttendance" ADD CONSTRAINT "ActivityAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DojoAttendance" ADD CONSTRAINT "DojoAttendance_dojoId_fkey" FOREIGN KEY ("dojoId") REFERENCES "Dojos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DojoAttendance" ADD CONSTRAINT "DojoAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exams" ADD CONSTRAINT "Exams_martialArtId_fkey" FOREIGN KEY ("martialArtId") REFERENCES "MartialArts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exams" ADD CONSTRAINT "Exams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exams" ADD CONSTRAINT "Exams_ranksId_fkey" FOREIGN KEY ("ranksId") REFERENCES "Ranks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exams" ADD CONSTRAINT "Exams_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppliedStudents" ADD CONSTRAINT "AppliedStudents_martialArtId_fkey" FOREIGN KEY ("martialArtId") REFERENCES "MartialArts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppliedStudents" ADD CONSTRAINT "AppliedStudents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppliedStudents" ADD CONSTRAINT "AppliedStudents_ranksId_fkey" FOREIGN KEY ("ranksId") REFERENCES "Ranks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppliedStudents" ADD CONSTRAINT "AppliedStudents_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranks" ADD CONSTRAINT "Ranks_martialArtId_fkey" FOREIGN KEY ("martialArtId") REFERENCES "MartialArts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethods" ADD CONSTRAINT "PaymentMethods_dojoId_fkey" FOREIGN KEY ("dojoId") REFERENCES "Dojos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
