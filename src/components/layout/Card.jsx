const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white shadow-md rounded-xl p-6 mx-auto my-8 w-full max-w-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;