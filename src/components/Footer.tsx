const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-center text-sm py-4 mt-8 border-t">
      <p>
        © {new Date().getFullYear()} SimpleNews. Tempatnya kamu dapat
        mendapatkan berita terupdate dan terkini tanpa adanya HOAX.
      </p>
    </footer>
  );
};

export default Footer;
